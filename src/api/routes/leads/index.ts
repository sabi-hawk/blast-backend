import multer from "multer";
import { Router } from "express";
import * as leadsController from "@controllers/leads";
import { authenticateRequest } from "@middleware/auth";
import { getUserGroupsWithCounts } from "@controllers/leads";



const leadsRouter = Router();

// Multer for file upload
const upload = multer({ dest: "uploads/" });

leadsRouter.post("/import/:userId", upload.single("file"), leadsController.importLeads);
leadsRouter.get("/", authenticateRequest, leadsController.getLeads);

// New routes
leadsRouter.put("/:leadId", authenticateRequest, leadsController.updateLead);
leadsRouter.delete("/:leadId", authenticateRequest, leadsController.deleteLead);
leadsRouter.get("/groups/summary", authenticateRequest, getUserGroupsWithCounts);

export default leadsRouter;
