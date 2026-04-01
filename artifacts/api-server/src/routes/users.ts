import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { CreateUserBody, LoginUserBody, ApproveUserParams } from "@workspace/api-zod";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

const sanitize = (u: typeof usersTable.$inferSelect) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  approved: u.approved,
  createdAt: u.createdAt,
});

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

    (req.session as Record<string, unknown>).userId = user.id;
    res.json(sanitize(user));
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(400).json({ error: "Invalid login data" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const session = req.session as Record<string, unknown>;
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

    res.json(sanitize(user));
  } catch (err) {
    req.log.error({ err }, "Error approving user");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
