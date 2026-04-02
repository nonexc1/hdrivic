import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { CreateUserBody, LoginUserBody, ApproveUserParams } from "@workspace/api-zod";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendApprovalEmail } from "../lib/mailer.js";

const router: IRouter = Router();

const sanitize = (u: typeof usersTable.$inferSelect) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  approved: u.approved,
  createdAt: u.createdAt,
});

function getSession(req: any): { userId?: number; role?: string } {
  return req.session as Record<string, unknown> ?? {};
}

router.get("/", async (req, res) => {
  try {
    const [users, totalResult] = await Promise.all([
      db.select().from(usersTable).orderBy(usersTable.createdAt),
      db.select({ count: count() }).from(usersTable),
    ]);
    res.json({ users: users.map(sanitize), total: totalResult[0].count });
  } catch (err) {
    req.log.error({ err }, "Error listing users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateUserBody.parse(req.body);

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email));

    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({ name: body.name, email: body.email, passwordHash, role: "pending", approved: false })
      .returning();

    res.status(201).json(sanitize(user));
  } catch (err) {
    req.log.error({ err }, "Error creating user");
    res.status(400).json({ error: "Invalid user data" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = LoginUserBody.parse(req.body);
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email));

    if (!user) {
      res.status(401).json({ error: "Credenciales incorrectas" });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Credenciales incorrectas" });
      return;
    }

    if (!user.approved) {
      res.status(401).json({ error: "Tu cuenta está pendiente de aprobación por el administrador" });
      return;
    }

    const session = req.session as Record<string, unknown>;
    session.userId = user.id;
    session.role = user.role;
    res.json(sanitize(user));
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(400).json({ error: "Invalid login data" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId as number));

    if (!user) {
      res.status(401).json({ error: "Session invalid" });
      return;
    }

    res.json(sanitize(user));
  } catch (err) {
    req.log.error({ err }, "Error fetching current user");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /users/me/change-password — any authenticated user: change their own password
router.patch("/me/change-password", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId as number));
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ error: "La contraseña actual es incorrecta" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error changing own password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    req.session.destroy(() => {});
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error logging out");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = ApproveUserParams.parse({ id: parseInt(req.params.id) });
    const [user] = await db
      .update(usersTable)
      .set({ approved: true, role: "admin" })
      .where(eq(usersTable.id, id))
      .returning();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    sendApprovalEmail(user.email, user.name);

    res.json(sanitize(user));
  } catch (err) {
    req.log.error({ err }, "Error approving user");
    res.status(400).json({ error: "Invalid request" });
  }
});

// PATCH /users/:id/role — owner only: change role of any user
router.patch("/:id/role", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId || session.role !== "owner") {
      res.status(403).json({ error: "Solo el owner puede cambiar roles" });
      return;
    }

    const id = parseInt(req.params.id);
    const { role } = req.body as { role: string };

    if (!["admin", "owner", "pending"].includes(role)) {
      res.status(400).json({ error: "Rol inválido" });
      return;
    }

    const [user] = await db
      .update(usersTable)
      .set({ role, approved: role !== "pending" })
      .where(eq(usersTable.id, id))
      .returning();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(sanitize(user));
  } catch (err) {
    req.log.error({ err }, "Error changing role");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /users/:id/reset-password — owner only: set new password for any user
router.patch("/:id/reset-password", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId || session.role !== "owner") {
      res.status(403).json({ error: "Solo el owner puede restablecer contraseñas" });
      return;
    }

    const id = parseInt(req.params.id);
    const { newPassword } = req.body as { newPassword: string };

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const [user] = await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, id))
      .returning();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error resetting password");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
