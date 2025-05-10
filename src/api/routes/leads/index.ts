import multer from "multer";
import { Router } from "express";
import * as leadsController from "@controllers/leads";



const leadsRouter = Router();

// Multer for file upload
const upload = multer({ dest: "uploads/" });

leadsRouter.post("/import/:userId", upload.single("file"), leadsController.importLeads);

export default leadsRouter;
