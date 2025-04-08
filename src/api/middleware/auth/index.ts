import { Request, Response } from "express";
import jwt from "jsonwebtoken"
import { SECRET } from "../../../config/app";
import Session from "../../../models/Session";
import { HttpError } from "@controllers/index";

export const authenticateRequest = async (req: Request, res: Response) => {
    try {

        const token = req.header("auth-token");
        if (!token) {
            throw new HttpError(401, 'Unauthorized Access');
        }
        const decode: any = jwt.verify(token, SECRET);
        const session = await Session.findOne({ _id: decode.sessionId })

        if (!session) {
            throw new HttpError(401, 'Session not found');
        }

        if (session.expiresAt) {
            const now = new Date().getTime();
            const expiresAt = new Date(session.expiresAt).getTime();
            if (now > expiresAt) {
                throw new HttpError(401, 'Session expired');
            }
        }
        return decode;
    } catch (error: any) {
        console.log("Error | utils | mongo | authenticate")
        throw error;
    }
}