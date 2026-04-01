import { Router, type IRouter } from "express";
import { db, propertiesTable } from "@workspace/db";
import {
  CreatePropertyBody,
  UpdatePropertyBody,
  ListPropertiesQueryParams,
  GetPropertyParams,
  UpdatePropertyParams,
  DeletePropertyParams,
} from "@workspace/api-zod";
import { eq, and, gte, lte, sql, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListPropertiesQueryParams.parse(req.query);

    const conditions = [];
    if (query.status) conditions.push(eq(propertiesTable.status, query.status));
    if (query.type) conditions.push(eq(propertiesTable.type, query.type));
    if (query.district) conditions.push(eq(propertiesTable.district, query.district));
    if (query.featured !== undefined && query.featured !== null) {
      conditions.push(eq(propertiesTable.featured, query.featured));
    }
    if (query.minPrice) {
      conditions.push(gte(propertiesTable.price, String(query.minPrice)));
    }
    if (query.maxPrice) {
      conditions.push(lte(propertiesTable.price, String(query.maxPrice)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [properties, totalResult] = await Promise.all([
      db
        .select()
        .from(propertiesTable)
        .where(whereClause)
        .limit(query.limit ?? 50)
        .offset(query.offset ?? 0)
        .orderBy(propertiesTable.createdAt),
      db
        .select({ count: count() })
        .from(propertiesTable)
        .where(whereClause),
    ]);

    const mapped = properties.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      area: p.area ? parseFloat(p.area) : null,
    }));

    res.json({ properties: mapped, total: totalResult[0].count });
  } catch (err) {
    req.log.error({ err }, "Error listing properties");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreatePropertyBody.parse(req.body);
    const [property] = await db
      .insert(propertiesTable)
      .values({
        ...body,
        price: String(body.price),
        area: body.area != null ? String(body.area) : null,
      })
      .returning();

    res.status(201).json({
      ...property,
      price: parseFloat(property.price),
      area: property.area ? parseFloat(property.area) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating property");
    res.status(400).json({ error: "Invalid property data" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const properties = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.featured, true))
      .limit(6)
      .orderBy(propertiesTable.createdAt);

    const mapped = properties.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      area: p.area ? parseFloat(p.area) : null,
    }));

    res.json({ properties: mapped, total: mapped.length });
  } catch (err) {
    req.log.error({ err }, "Error fetching featured properties");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const [all, byStatus, byType, byDistrict] = await Promise.all([
      db.select({ count: count() }).from(propertiesTable),
      db
        .select({ status: propertiesTable.status, count: count() })
        .from(propertiesTable)
        .groupBy(propertiesTable.status),
      db
        .select({ type: propertiesTable.type, count: count() })
        .from(propertiesTable)
        .groupBy(propertiesTable.type),
      db
        .select({ district: propertiesTable.district, count: count() })
        .from(propertiesTable)
        .groupBy(propertiesTable.district),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((r) => { statusMap[r.status] = r.count; });

    res.json({
      totalProperties: all[0].count,
      forSale: statusMap["venta"] ?? 0,
      forRent: statusMap["alquiler"] ?? 0,
      airbnb: statusMap["airbnb"] ?? 0,
      sold: statusMap["vendido"] ?? 0,
      byType: byType.map((r) => ({ label: r.type, count: r.count })),
      byDistrict: byDistrict.map((r) => ({ label: r.district, count: r.count })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching property stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/districts", async (req, res) => {
  try {
    const rows = await db
      .selectDistinct({ district: propertiesTable.district })
      .from(propertiesTable)
      .orderBy(propertiesTable.district);

    res.json({ districts: rows.map((r) => r.district) });
  } catch (err) {
    req.log.error({ err }, "Error fetching districts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetPropertyParams.parse({ id: parseInt(req.params.id) });
    const [property] = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, id));

    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    res.json({
      ...property,
      price: parseFloat(property.price),
      area: property.area ? parseFloat(property.area) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching property");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = UpdatePropertyParams.parse({ id: parseInt(req.params.id) });
    const body = UpdatePropertyBody.parse(req.body);

    const updates: Record<string, unknown> = { ...body };
    if (body.price !== undefined) updates.price = String(body.price);
    if (body.area !== undefined) updates.area = body.area != null ? String(body.area) : null;

    const [property] = await db
      .update(propertiesTable)
      .set(updates)
      .where(eq(propertiesTable.id, id))
      .returning();

    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    res.json({
      ...property,
      price: parseFloat(property.price),
      area: property.area ? parseFloat(property.area) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating property");
    res.status(400).json({ error: "Invalid update data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeletePropertyParams.parse({ id: parseInt(req.params.id) });
    await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting property");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
