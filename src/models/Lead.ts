import { Schema, model, Document } from "mongoose";
import User, { UserType } from "./User";

export interface LeadType extends Document {
  userId: UserType["_id"];
  groupId: string;
  groupName: string;
  email: string;
  phone: string;
  time: string;
  tags: string;
  description: string;
  createdAt: Date;
}

const LeadSchema = new Schema<LeadType>({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  groupId: { type: String },
  groupName: { type: String },
  email: { type: String },
  phone: { type: String },
  time: { type: String },
  tags: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Lead = model<LeadType>("lead", LeadSchema);

export default Lead;
