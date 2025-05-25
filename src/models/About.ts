import { Schema, model, InferSchemaType, Document } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8000;
const DEFAULT_PROFILE_PIC = `http://localhost:${PORT}/uploads/images/profile.png`;

const AboutSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  profilePic: {
    type: String,
    default: DEFAULT_PROFILE_PIC
  },
  dob: {
    type: Date,
    default: null
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add middleware to update the updatedAt timestamp
AboutSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Infer the type and extend with Document
export type AboutType = InferSchemaType<typeof AboutSchema> & Document;

// Create the model
const About = model<AboutType>("about", AboutSchema);

export default About; 