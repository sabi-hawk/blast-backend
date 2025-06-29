import { Request, Response } from "express";
import * as xlsx from "xlsx";
import fs from "fs";
import Lead from "@models/Lead";
import User from "@models/User";
import { httpMethod, HttpError } from ".."; // assuming your existing structure
import { Types } from "mongoose";

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


export const getLeads = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!userId) throw new HttpError(400, "User ID is missing from token");

  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    Lead.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Lead.countDocuments({ userId }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data: leads,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

export const updateLead = httpMethod(async (req: Request, res: Response) => {
  const leadId = req.params.leadId;
  const updateData = req.body;

  const lead = await Lead.findById(leadId);
  if (!lead) throw new HttpError(404, "Lead not found");

  Object.assign(lead, updateData);
  await lead.save();

  res.status(200).json({ message: "Lead updated successfully", data: lead });
});

export const deleteLead = httpMethod(async (req: Request, res: Response) => {
  const leadId = req.params.leadId;

  const lead = await Lead.findById(leadId);
  if (!lead) throw new HttpError(404, "Lead not found");

  await lead.deleteOne();

  res.status(200).json({ message: "Lead deleted successfully" });
});

export const getUserGroupsWithCounts = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  console.log("TESTING USER ID");
  console.log(userId);
  if (!userId) throw new HttpError(400, "User ID is missing from token");

  // Aggregate unique groupIds and their counts for this user
  const groups = await Lead.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    { $group: { _id: "$groupId", count: { $sum: 1 } } },
    { $project: { groupId: "$_id", count: 1, _id: 0 } },
  ]);

  res.status(200).json({ groups });
});

export const getLeadAnalytics = httpMethod(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(400, "User ID is missing from token");

  // Total leads
  const total = await Lead.countDocuments({ userId });

  // Leads per group
  const perGroup = await Lead.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    { $group: { _id: "$groupId", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Leads per month (last 12 months)
  const monthly = await Lead.aggregate([
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
    stats: { total },
    perGroup,
    monthly
  });
});