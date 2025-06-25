import Campaign from "@models/Campaign";
import Lead from "@models/Lead";
import { sendBulkEmails, getCampaignHtmlContent } from "./emailService";

export const processScheduledCampaigns = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Find all scheduled campaigns that should be sent now
    const scheduledCampaigns = await Campaign.find({
      status: "Scheduled",
      scheduleDate: { $lte: now }
    });

    console.log(`Found ${scheduledCampaigns.length} scheduled campaigns to process`);

    for (const campaign of scheduledCampaigns) {
      try {
        // Get all emails from the specified groups
        const leads = await Lead.find({ 
          userId: campaign.userId, 
          groupId: { $in: campaign.groupIds } 
        });
        
        const emails = leads.map(lead => lead.email).filter(email => email && email.trim() !== '');
        
        if (emails.length > 0) {
          // Get actual template HTML
          let htmlContent = '';
          try {
            htmlContent = await getCampaignHtmlContent(campaign.template.id);
          } catch (err) {
            htmlContent = `<html><body><h2>${campaign.campaignName}</h2><p>${campaign.description || 'This is a scheduled campaign email.'}</p></body></html>`;
          }
          // Use provided mailSubject
          const subject = campaign.mailSubject || `Campaign: ${campaign.campaignName}`;
          const emailResults = await sendBulkEmails(emails, subject, htmlContent);
          // Update campaign status based on results
          if (emailResults.failed === 0) {
            campaign.status = "Completed";
          } else if (emailResults.success > 0) {
            campaign.status = "In Progress";
          }
          await campaign.save();
          
          console.log(`Scheduled campaign ${campaign.campaignName} processed: ${emailResults.success} sent, ${emailResults.failed} failed`);
        } else {
          console.log(`No valid emails found for scheduled campaign ${campaign.campaignName}`);
          campaign.status = "Completed"; // Mark as completed even if no emails
          await campaign.save();
        }
      } catch (error) {
        console.error(`Error processing scheduled campaign ${campaign.campaignName}:`, error);
        // Continue with other campaigns even if one fails
      }
    }
  } catch (error) {
    console.error('Error in processScheduledCampaigns:', error);
  }
}; 