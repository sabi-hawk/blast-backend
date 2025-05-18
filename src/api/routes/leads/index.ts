import multer from "multer";
import { Router } from "express";
import * as leadsController from "@controllers/leads";
import { authenticateRequest } from "@middleware/auth";



const leadsRouter = Router();

// Multer for file upload
const upload = multer({ dest: "uploads/" });

leadsRouter.post("/import/:userId", upload.single("file"), leadsController.importLeads);
leadsRouter.get("/", authenticateRequest, leadsController.getLeads);

// New routes
leadsRouter.put("/:leadId", authenticateRequest, leadsController.updateLead);
leadsRouter.delete("/:leadId", authenticateRequest, leadsController.deleteLead);

export default leadsRouter;
