// import { Request, Response } from "express";
// import jwt from "jsonwebtoken"
import { SECRET } from "../../../config/app";
// import Session from "../../../models/Session";
import { HttpError } from "@controllers/index";

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Session from "@models/Session";
// import { HttpError } from "..";
// const SECRET = process.env.JWT_SECRET || "your_secret"; // adjust as per your setup

// export const authenticateRequest = async (req: Request, res: Response) => {
//     try {

//         const token = req.header("auth-token");
//         if (!token) {
//             throw new HttpError(401, 'Unauthorized Access');
//         }
//         const decode: any = jwt.verify(token, SECRET);
//         const session = await Session.findOne({ _id: decode.sessionId })

//         if (!session) {
//             throw new HttpError(401, 'Session not found');
//         }

//         if (session.expiresAt) {
//             const now = new Date().getTime();
//             const expiresAt = new Date(session.expiresAt).getTime();
//             if (now > expiresAt) {
//                 throw new HttpError(401, 'Session expired');
//             }
//         }
//         return decode;
//     } catch (error: any) {
//         console.log("Error | utils | mongo | authenticate")
//         throw error;
//     }
// }

export const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("auth-token");
        if (!token) throw new HttpError(401, "Unauthorized Access");

        const decode: any = jwt.verify(token, SECRET);
        const session = await Session.findById(decode.sessionId);

        if (!session) throw new HttpError(401, "Session not found");

        const now = Date.now();
        if (!session.expiresAt) {
            throw new HttpError(401, 'Session expiration time is missing');
        }
        const expiresAt = new Date(session.expiresAt).getTime();
        if (now > expiresAt) throw new HttpError(401, "Session expired");
        
        // ✅ Attach userId to req
        // @ts-ignore
        req.user = {
            userId: decode.userId,
            email: decode.email,
            sessionId: decode.sessionId,
        };

        next();
    } catch (error: any) {
        console.error("Auth Error:", error.message);
        res.status(error.status || 500).json({ message: error.message });
    }
};