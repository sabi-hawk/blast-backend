import { Schema, model, InferSchemaType, Document } from "mongoose";

// Define your schema
const UserSchema = new Schema({
  name: {
    first: { type: String, trim: true },
    last: { type: String, trim: true },
  },
  email: { type: String, trim: true, lowercase: true, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  dob: { type: String },
  role: {
    type: String,
    enum: ["provider", "client", "admin"],
    default: "provider",
    required: true,
  },
  loggedInAt: { type: Date },
  lastLoggedInAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Infer the type and extend with Document
export type UserType = InferSchemaType<typeof UserSchema> & Document;

// Create the model
const User = model<UserType>("user", UserSchema);

export default User;
