import { Router } from "express";
import * as campaignsController from "@controllers/campaigns";
import { authenticateRequest } from "@middleware/auth";

const campaignsRouter = Router();

campaignsRouter.post("/", authenticateRequest, campaignsController.addCampaign);
campaignsRouter.get("/", authenticateRequest, campaignsController.getCampaigns);
campaignsRouter.put("/:campaignId", authenticateRequest, campaignsController.editCampaign);
campaignsRouter.delete("/:campaignId", authenticateRequest, campaignsController.deleteCampaign);

export default campaignsRouter; 