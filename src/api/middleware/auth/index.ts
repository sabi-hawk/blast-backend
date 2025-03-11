import { Request, Response } from "express";
import jwt from "jsonwebtoken"
import { SECRET } from "../../../config/app";
import Session from "../../../models/Session";

export const authenticateRequest = async (req: Request, res: Response) => {
    try {

        const token = req.header("auth-token");
        if (!token) {
            throw {
                status: 401,
                message: 'Unauthorized Access'
            }
        }
        const decode: any = jwt.verify(token, SECRET);
        const session = await Session.findOne({ _id: decode.sessionId })

        if (!session) {
            throw {
                status: 401,
                message: 'Session not found'
            }
        }

        if (session.expiresAt) {
            const now = new Date().getTime();
            const expiresAt = new Date(session.expiresAt).getTime();
            if (now > expiresAt) {
                throw {
                    status: 401,
                    message: 'Session expired'
                }
            }
        }
        return decode;
    } catch (error: any) {
        console.log("Error | utils | mongo | authenticate")
        throw error;
    }
}