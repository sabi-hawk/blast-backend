import { Request, Response } from "express";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";
import Lead from "@models/Lead";
import User from "@models/User";
import { httpMethod, HttpError } from ".."; // assuming your existing structure

export const importLeads = httpMethod(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");

  if (!req.file) throw new HttpError(400, "No file uploaded");

  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const leads = data.map((item: any) => ({
    userId,
    groupId: item["Group Id"],
    groupName: item["Group Name"],
    email: item["Email"],
    phone: item["Phone"],
    time: item["Time"],
    tags: item["Tags"],
    description: item["Description"],
  }));

  await Lead.insertMany(leads);

  // Delete uploaded file after processing
  fs.unlinkSync(req.file.path);

  res.status(200).json({ message: "Leads Imported Successfully!" });
});
