import { Router } from "express";
import * as campaignsController from "@controllers/campaigns";
import { authenticateRequest } from "@middleware/auth";

const campaignsRouter = Router();

campaignsRouter.post("/", authenticateRequest, campaignsController.addCampaign);
campaignsRouter.get("/", authenticateRequest, campaignsController.getCampaigns);
campaignsRouter.get("/stats", authenticateRequest, campaignsController.getCampaignStats);
campaignsRouter.put("/:campaignId", authenticateRequest, campaignsController.editCampaign);
campaignsRouter.delete("/:campaignId", authenticateRequest, campaignsController.deleteCampaign);
campaignsRouter.post("/:campaignId/process", authenticateRequest, campaignsController.processCampaign);
campaignsRouter.post("/process-scheduled", authenticateRequest, campaignsController.processScheduledCampaigns);
campaignsRouter.get("/analytics", authenticateRequest, campaignsController.getCampaignAnalytics);

export default campaignsRouter; 