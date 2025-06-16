import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { HttpError, httpMethod } from ".."; // Ensure httpMethod is imported correctly
import Template from "@models/Template";
import User from "@models/User";
import { ObjectId } from "mongodb";
import publicTemplates from "@public/templates/public/publicTemplates.json"; // Adjusted import for publicTemplates.json

interface Template {
    name: string;
    _id: string;
}

interface PublicTemplate {
    name: string;
    _id?: string | null; // Optional _id for public templates
}

export const saveDesign = httpMethod(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const templateId = req.params.id; // Optional
    console.log("TEMPLATE ID");
    console.log(templateId);
    // Validate User
    const user = await User.findById(userId);
    if (!user) throw new HttpError(404, "User not found");

    let template;
    let message;

    // If templateId is public or not provided, treat as new template
    if (templateId && !templateId.startsWith("public")) {
        // UPDATE existing template
        template = await Template.findById(templateId);
        console.log("TEMPLATE ID Check 2");
        if (!template) throw new HttpError(404, "Template not found");

        // Update files
        fs.writeFileSync(template.jsonPath, JSON.stringify(req.body.design));
        fs.writeFileSync(template.htmlPath, req.body.html);

        template.name = req.params.name;
        await template.save();
        message = "Design Updated Successfully!";
    } else {
        // CREATE new template
        // Check for duplicate name in public templates
        const publicNameExists = publicTemplates.some((t: any) => t.name === req.params.name);
        if (publicNameExists) throw new HttpError(400, "Template name already exists in public templates");
        // Check for duplicate name in user's templates
        const userTemplateExists = await Template.findOne({ userId, name: req.params.name });
        if (userTemplateExists) throw new HttpError(400, "Template name already exists");

        const fileName = `${userId}_${Date.now()}`;
        const jsonFilePath = path.resolve(__dirname, `../../../../public/templates/${fileName}.json`);
        const htmlFilePath = path.resolve(__dirname, `../../../../public/templates/html/${fileName}.html`);

        fs.writeFileSync(jsonFilePath, JSON.stringify(req.body.design));
        fs.writeFileSync(htmlFilePath, req.body.html);

        template = new Template({
            userId,
            name: req.params.name,
            jsonPath: jsonFilePath,
            htmlPath: htmlFilePath,
        });
        await template.save();
        message = "Design Saved Successfully!";
    }

    // Return response
    const templates = await Template.find({ userId }).select("_id name");
    const allTemplates = [
        ...templates.map((t) => ({
            _id: t._id,
            name: t.name,
        })),
        ...publicTemplates.map((template: PublicTemplate) => ({
            _id: template._id,
            name: template.name,
        })),
    ];
    res.status(200).json({
        message,
        files: allTemplates,
    });
});


// Get Design
export const getDesign = httpMethod(async (req: Request, res: Response) => {
    const templateId = req.query.id as string;
    if (!templateId) throw new HttpError(400, "Template Id is required");

    // Check if the template is a public one
    if (templateId.startsWith("public_")) {
        // Handle public templates
        const publicTemplatePath = path.resolve(__dirname, "../../../../public/templates/public", `${templateId.replace("public_", "")}.json`);

        fs.readFile(publicTemplatePath, "utf-8", (err, jsonString) => {
            if (err) {
                throw new HttpError(500, "Error reading public template jsonDesign");
            }
            res.status(200).json({ design: JSON.parse(jsonString) });
        });
    } else {
        // Handle user-specific templates
        const template = await Template.findOne({ _id: new ObjectId(templateId) });
        if (!template) throw new HttpError(404, "Design not found");

        fs.readFile(template.jsonPath, "utf-8", (err, jsonString) => {
            if (err) {
                throw new HttpError(500, "Error reading user template jsonDesign");
            }
            res.status(200).json({ design: JSON.parse(jsonString) });
        });
    }
});

export const getDesignNames = httpMethod(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) throw new HttpError(404, "User not found");

    // Fetch user templates from the database
    const templates = await Template.find({ userId }).select("_id name");

    // Return the templates combining user templates and public templates
    const allTemplates = [
        ...templates.map((template) => ({
            _id: template._id,
            name: template.name,
        })),
        ...publicTemplates.map((template: PublicTemplate) => ({
            _id: template._id, // For public templates, we don't have an _id
            name: template.name,
        })),
    ];

    res.status(200).json({
        files: allTemplates,
    });
});
