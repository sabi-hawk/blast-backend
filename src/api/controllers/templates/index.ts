import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { HttpError, httpMethod } from ".."; // Ensure httpMethod is imported correctly
import Template from "@models/Template";
import User from "@models/User";

// Save Design
export const saveDesign = httpMethod(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const name = req.params.name;

    // Validate User
    const user = await User.findById(userId);
    if (!user) throw new HttpError(404, "User not found");

    // Check if file with the same name exists for this user
    const existingTemplate = await Template.findOne({ userId, name });
    if (existingTemplate) {
        throw new HttpError(400, "Template name already exists. Please use a different name.");
    }

    // Define file paths
    const fileName = `${userId}_${Date.now()}`;
    const jsonFilePath = path.resolve(__dirname, `../../../../public/templates/${fileName}.json`);
    const htmlFilePath = path.resolve(__dirname, `../../../../public/templates/html/${fileName}.html`);

    // Save files
    fs.writeFileSync(jsonFilePath, JSON.stringify(req.body.design));
    fs.writeFileSync(htmlFilePath, req.body.html);

    // Save to database
    const newTemplate = new Template({ userId, name, jsonPath: jsonFilePath, htmlPath: htmlFilePath });
    await newTemplate.save();

    // Return success response
    res.status(200).json({ message: "Design Saved Successfully!" });
});

// Get Design
export const getDesign = httpMethod(async (req: Request, res: Response) => {
    const fileName = req.query.name as string;
    if (!fileName) throw new HttpError(400, "File name is required");

    const template = await Template.findOne({ name: fileName });
    if (!template) throw new HttpError(404, "Design not found");

    fs.readFile(template.jsonPath, "utf-8", (err, jsonString) => {
        if (err) {
            throw new HttpError(500, "Error reading jsonDesign");
        }
        res.status(200).json({ design: JSON.parse(jsonString) });
    });
});

// Get Design Names for User
export const getDesignNames = httpMethod(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const templates = await Template.find({ userId }).select("_id name");

    res.status(200).json({
        files: templates.map(template => ({
            _id: template._id,
            name: template.name,
        })),
    });
});
