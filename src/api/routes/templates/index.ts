import { Router } from "express";
import * as templatesController from "../../controllers/templates";

const templatesRouter = Router();
templatesRouter.get("/user/:userId/names", templatesController.getDesignNames);
templatesRouter.post("/user/:userId/save/:name", templatesController.saveDesign);
templatesRouter.get("/design", templatesController.getDesign);

export default templatesRouter;