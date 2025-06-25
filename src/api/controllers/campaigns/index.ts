import { Request, Response } from "express";
import { httpMethod, HttpError } from "..";
import Campaign from "@models/Campaign";
import Lead from "@models/Lead";
import { sendBulkEmails, getCampaignHtmlContent } from "@utils/emailService";
import { Types } from "mongoose";

export const addCampaign = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(400, "User ID is missing from token");
  const { template, groupIds, campaignName, description, scheduled, scheduleDate, totalLeads, mailSubject } = req.body;
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
    mailSubject,
  });
  await campaign.save();

  // Respond immediately
  res.status(201).json({ message: "Campaign created successfully", data: campaign });

  // If campaign is not scheduled, send emails in the background
  if (status !== "Scheduled") {
    (async () => {
      try {
        // Get all emails from the specified groups
        const leads = await Lead.find({ 
          userId, 
          groupId: { $in: groupIds } 
        });
        
        const emails = leads.map(lead => lead.email).filter(email => email && email.trim() !== '');
        
        if (emails.length > 0) {
          // Get actual template HTML
          let htmlContent = '';
          try {
            htmlContent = await getCampaignHtmlContent(template.id);
          } catch (err) {
            htmlContent = `<html><body><h2>${campaignName}</h2><p>${description || 'This is a campaign email.'}</p></body></html>`;
          }
          const subject = mailSubject || `Campaign: ${campaignName}`;
          const emailResults = await sendBulkEmails(emails, subject, htmlContent);
          // Update campaign status to completed if all emails sent successfully
          if (emailResults.failed === 0) {
            campaign.status = "Completed";
            await campaign.save();
          }
          console.log(`Campaign email results: ${emailResults.success} sent, ${emailResults.failed} failed`);
        }
      } catch (error) {
        console.error('Error sending campaign emails:', error);
        // Don't throw error here to avoid breaking the campaign creation
      }
    })();
  }
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

// Function to process and send campaign emails
export const processCampaign = httpMethod(async (req: Request, res: Response) => {
  const campaignId = req.params.campaignId;
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(400, "User ID is missing from token");

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new HttpError(404, "Campaign not found");

  // Check if campaign belongs to the user
  if ((campaign.userId as any).toString() !== userId) {
    throw new HttpError(403, "Access denied");
  }

  try {
    // Get all emails from the specified groups
    const leads = await Lead.find({ 
      userId, 
      groupId: { $in: campaign.groupIds } 
    });
    
    const emails = leads.map(lead => lead.email).filter(email => email && email.trim() !== '');
    
    if (emails.length === 0) {
      throw new HttpError(400, "No valid emails found for the specified groups");
    }

    // Get actual template HTML
    let htmlContent = '';
    try {
      htmlContent = await getCampaignHtmlContent(campaign.template.id);
    } catch (err) {
      htmlContent = `<html><body><h2>${campaign.campaignName}</h2><p>${campaign.description || 'This is a campaign email.'}</p></body></html>`;
    }
    const subject = campaign.mailSubject || `Campaign: ${campaign.campaignName}`;
    const emailResults = await sendBulkEmails(emails, subject, htmlContent);
    // Update campaign status based on results
    if (emailResults.failed === 0) {
      campaign.status = "Completed";
    } else if (emailResults.success > 0) {
      campaign.status = "In Progress";
    }
    await campaign.save();
    
    res.status(200).json({ 
      message: "Campaign processed successfully", 
      data: {
        campaign,
        emailResults: {
          total: emails.length,
          success: emailResults.success,
          failed: emailResults.failed
        }
      }
    });
  } catch (error) {
    console.error('Error processing campaign:', error);
    throw new HttpError(500, "Failed to process campaign");
  }
});

// Function to process all scheduled campaigns (admin function)
export const processScheduledCampaigns = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(400, "User ID is missing from token");

  try {
    const { processScheduledCampaigns } = await import("@utils/campaignScheduler");
    await processScheduledCampaigns();
    
    res.status(200).json({ 
      message: "Scheduled campaigns processing completed" 
    });
  } catch (error) {
    console.error('Error processing scheduled campaigns:', error);
    throw new HttpError(500, "Failed to process scheduled campaigns");
  }
});

// Function to get campaign statistics
export const getCampaignStats = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(400, "User ID is missing from token");

  try {
    // Get counts for each status
    const [scheduledCount, inProgressCount, completedCount, totalCount] = await Promise.all([
      Campaign.countDocuments({ userId, status: "Scheduled" }),
      Campaign.countDocuments({ userId, status: "In Progress" }),
      Campaign.countDocuments({ userId, status: "Completed" }),
      Campaign.countDocuments({ userId })
    ]);

    const stats = {
      scheduled: scheduledCount,
      inProgress: inProgressCount,
      completed: completedCount,
      total: totalCount
    };

    res.status(200).json({ 
      message: "Campaign statistics retrieved successfully",
      data: stats
    });
  } catch (error) {
    console.error('Error getting campaign statistics:', error);
    throw new HttpError(500, "Failed to get campaign statistics");
  }
});

export const getCampaignAnalytics = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(400, "User ID is missing from token");

  // Campaigns by status
  const [scheduled, inProgress, completed, total] = await Promise.all([
    Campaign.countDocuments({ userId, status: "Scheduled" }),
    Campaign.countDocuments({ userId, status: "In Progress" }),
    Campaign.countDocuments({ userId, status: "Completed" }),
    Campaign.countDocuments({ userId }),
  ]);

  // Campaigns per month (last 12 months)
  const monthly = await Campaign.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.status(200).json({
    stats: { scheduled, inProgress, completed, total },
    monthly
  });
}); 