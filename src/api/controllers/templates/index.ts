import { Request, Response } from "express";
// import User from "../../../models/User";
import fs from "fs";
// import { resolveContent } from "nodemailer/lib/shared";
import path from "path";

export const saveDesign = async (req: Request, res: Response) => {
    try {
        const userId: any = req.params.userId;

        const fileName = `${userId}_${Date.now()}.${req.params.name}`
        fs.writeFileSync(path.resolve(__dirname, `../../../../public/templates/${fileName}.json`), JSON.stringify(req.body.design));
        fs.writeFileSync(path.resolve(__dirname, `../../../../public/templates/html/${fileName}.html`), req.body.html);

        // now fetch aal file name

        fs.readdir(path.resolve(__dirname, "../../../../public/templates"), (err, files) => {
            if (err) {
                console.log("Error reading directory", err)
                return res.status(500).json({ message: "Something went wrong", error: err });
            }
            let filteredFiles: Array<any> = [];
            files.map((file: string) => {
                if ((file.startsWith(userId) || file.includes("design")) && file !== "html") {
                    filteredFiles.push(file)
                }
            })
            return res.status(200).json({ files: filteredFiles, message: "Design Saved Successfully!" })
        })

        // res.status(200).json({ message: "Design Saved Successfully!" });
    } catch (error) {
        console.log("Error | controller | templates | saveDesign | catch", error)
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}

export const getDesign = async (req: Request, res: Response) => {
    try {
        let fileName: any = req?.query?.name;
        const { name } = req.query;
        if (name === "" || name === undefined) {
            fileName = "emptyDesign.json"
        }
        fs.readFile(path.resolve(__dirname, `../../../../public/templates/${fileName}`), "utf-8", (err, jsonString) => {
            if (err) {
                console.log("Error reading jsonDesign", err);
                return res.status(500).json({ message: "Something went wrong", error: err });
            }
            try {
                const jsonDesign = JSON.parse(jsonString);
                res.status(200).json({ design: jsonDesign });
            } catch (err) {
                console.log("Error parsing JSON string:", err);
                res.status(500).json({ message: "Something went wrong", error: err });
            }
        });
    } catch (error) {
        console.log("Error | controller | templates | getDesign | catch", error)
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}

export const getHtml = async (req: Request, res: Response) => {
    try {
        let fileName: any = req?.query?.name;
        const { name } = req.query;
        if (name === "" || name === undefined) {
            fileName = "emptyDesign.json"
        }
        fs.readFile(path.resolve(__dirname, `../../../../public/templates/${fileName}`), "utf-8", (err, jsonString) => {
            if (err) {
                console.log("Error reading jsonDesign", err);
                return res.status(500).json({ message: "Something went wrong", error: err });
            }
            try {
                const jsonDesign = JSON.parse(jsonString);
                res.status(200).json({ design: jsonDesign });
            } catch (err) {
                console.log("Error parsing JSON string:", err);
                res.status(500).json({ message: "Something went wrong", error: err });
            }
        });
    } catch (error) {
        console.log("Error | controller | templates | getDesign | catch", error)
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}

export const getDesignNames = async (req: Request, res: Response) => {
    try {
        const userId: any = req.params.userId
        fs.readdir(path.resolve(__dirname, "../../../../public/templates"), (err, files) => {
            if (err) {
                console.log("Error reading directory", err)
                return res.status(500).json({ message: "Something went wrong", error: err });
            }
            let filteredFiles: Array<any> = [];
            files.map((file: string) => {
                if ((file.startsWith(userId) || file.includes("design")) && file !== "html") {
                    filteredFiles.push(file)
                }
            })
            return res.status(200).json({ files: filteredFiles })
        })
    } catch (error) {
        console.log("Error | controller | templates | getDesignNames | catch", error)
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}