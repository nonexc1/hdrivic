import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { CreateLeadBody } from "@workspace/api-zod";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const body = CreateLeadBody.parse(req.body);
    const [lead] = await db.insert(leadsTable).values(body).returning();
    res.status(201).json(lead);
  } catch (err) {
    req.log.error({ err }, "Error creating lead");
    res.status(400).json({ error: "Invalid lead data" });
  }
});

router.get("/", async (req, res) => {
  try {
    const [leads, totalResult] = await Promise.all([
      db.select().from(leadsTable).orderBy(leadsTable.createdAt),
      db.select({ count: count() }).from(leadsTable),
    ]);
    res.json({ leads, total: totalResult[0].count });
  } catch (err) {
    req.log.error({ err }, "Error listing leads");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
