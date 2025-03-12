import { Schema, model, Document } from "mongoose";
import User, { UserType } from "./User";

export interface TemplateType extends Document {
  userId: UserType["_id"];
  name: string;
  jsonPath: string;
  htmlPath: string;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<TemplateType>({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  name: { type: String, required: true, trim: true },
  jsonPath: { type: String, required: true },
  htmlPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Template = model<TemplateType>("template", TemplateSchema);

export default Template;
