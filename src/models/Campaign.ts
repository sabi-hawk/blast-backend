import { Schema, model, Document } from "mongoose";
import { UserType } from "./User";

export interface CampaignType extends Document {
  userId: UserType["_id"];
  template: { id: string; name: string };
  groupIds: string[];
  campaignName: string;
  description?: string;
  status: "Scheduled" | "In Progress" | "Completed";
  scheduleDate?: Date;
  totalLeads: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<CampaignType>({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  template: {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  groupIds: [{ type: String, required: true }],
  campaignName: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["Scheduled", "In Progress", "Completed"], default: "In Progress" },
  scheduleDate: { type: Date },
  totalLeads: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Campaign = model<CampaignType>("campaign", CampaignSchema);

export default Campaign; 