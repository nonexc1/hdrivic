import { Router, type IRouter } from "express";
import { db, leadsTable, propertiesTable, usersTable } from "@workspace/db";
import { CreateLeadBody } from "@workspace/api-zod";
import { count, eq, desc } from "drizzle-orm";
import { sendLeadNotificationEmail } from "../lib/mailer";

const router: IRouter = Router();

function getSession(req: any): { userId?: number; role?: string } {
  return (req.session as Record<string, unknown>) ?? {};
}

router.post("/", async (req, res) => {
  try {
    const body = CreateLeadBody.parse(req.body);
    const [lead] = await db
      .insert(leadsTable)
      .values({ ...body, status: "pendiente", isRead: false })
      .returning();

    if (lead.propertyId) {
      const [property] = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.id, lead.propertyId));

      if (property?.createdBy) {
        const [owner] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, property.createdBy));

        if (owner?.email) {
          sendLeadNotificationEmail(owner.email, owner.name, {
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            message: lead.message,
            type: lead.type,
          }, { id: property.id, title: property.title });
        }
      }
    }

    res.status(201).json(lead);
  } catch (err) {
    req.log.error({ err }, "Error creating lead");
    res.status(400).json({ error: "Invalid lead data" });
  }
});

router.get("/unread-count", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId) return res.status(401).json({ error: "Not authenticated" });
    const [result] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(eq(leadsTable.isRead, false));
    res.json({ count: Number(result.count) });
  } catch (err) {
    req.log.error({ err }, "Error fetching unread count");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/unread", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId) return res.status(401).json({ error: "Not authenticated" });
    const leads = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.isRead, false))
      .orderBy(desc(leadsTable.createdAt))
      .limit(20);
    res.json({ leads });
  } catch (err) {
    req.log.error({ err }, "Error fetching unread leads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId) return res.status(401).json({ error: "Not authenticated" });
    const [leads, totalResult] = await Promise.all([
      db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt)),
      db.select({ count: count() }).from(leadsTable),
    ]);
    res.json({ leads, total: Number(totalResult[0].count) });
  } catch (err) {
    req.log.error({ err }, "Error listing leads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    const { status } = req.body as { status: string };
    const allowed = ["pendiente", "atendido", "vendido", "rentado", "comprado"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const [lead] = await db
      .update(leadsTable)
      .set({ status })
      .where(eq(leadsTable.id, id))
      .returning();
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    req.log.error({ err }, "Error updating lead status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const session = getSession(req);
    if (!session.userId) return res.status(401).json({ error: "Not authenticated" });
    const id = parseInt(req.params.id);
    const [lead] = await db
      .update(leadsTable)
      .set({ isRead: true })
      .where(eq(leadsTable.id, id))
      .returning();
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    req.log.error({ err }, "Error marking lead as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
