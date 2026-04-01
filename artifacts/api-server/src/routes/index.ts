import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import leadsRouter from "./leads";
import usersRouter from "./users";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/properties", propertiesRouter);
router.use("/leads", leadsRouter);
router.use("/users", usersRouter);
router.use("/storage", storageRouter);

export default router;
