import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import Campaign from "@models/Campaign";

export const addCampaign = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(400, "User ID is missing from token");
  const { template, groupIds, campaignName, description, scheduled, scheduleDate, totalLeads } = req.body;
  if (!campaignName) throw new HttpError(400, "Campaign name is required");
  let status: "Scheduled" | "In Progress" | "Completed" = "In Progress";
  if (scheduled) status = "Scheduled";
  const campaign = new Campaign({
    userId,
    template,
    groupIds,
    campaignName,
    description,
    status,
    scheduleDate,
    totalLeads,
  });
  await campaign.save();
  res.status(201).json({ message: "Campaign created successfully", data: campaign });
});

export const getCampaigns = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(400, "User ID is missing from token");
  const campaigns = await Campaign.find({ userId }).sort({ createdAt: -1 });
  const data = campaigns.map(c => ({
    _id: c._id,
    campaignName: c.campaignName,
    template: c.template,
    groupIds: c.groupIds.join(", "),
    createdAt: c.createdAt,
    scheduleDate: c.scheduleDate,
    status: c.status,
    description: c.description,
    totalLeads: c.totalLeads,
  }));
  res.status(200).json({ data });
});

export const editCampaign = httpMethod(async (req: Request, res: Response) => {
  const campaignId = req.params.campaignId;
  const updateData = req.body;
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new HttpError(404, "Campaign not found");
  if (updateData.campaignName === undefined) throw new HttpError(400, "Campaign name is required");
  Object.assign(campaign, updateData);
  await campaign.save();
  res.status(200).json({ message: "Campaign updated successfully", data: campaign });
});

export const deleteCampaign = httpMethod(async (req: Request, res: Response) => {
  const campaignId = req.params.campaignId;
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new HttpError(404, "Campaign not found");
  await campaign.deleteOne();
  res.status(200).json({ message: "Campaign deleted successfully" });
}); 