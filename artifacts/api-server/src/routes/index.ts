import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import leadsRouter from "./leads";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/properties", propertiesRouter);
router.use("/leads", leadsRouter);
router.use("/users", usersRouter);

export default router;
