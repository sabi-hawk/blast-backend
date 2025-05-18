import { Router } from "express";
import * as conversationController from "@controllers/conversation";
import { authenticateRequest } from "@middleware/auth";

const conversationRouter = Router();

conversationRouter.post("/", authenticateRequest, conversationController.createConversation);
conversationRouter.post("/:chatId/message", authenticateRequest, conversationController.sendMessage);
conversationRouter.get("/:chatId/message/:messageId", authenticateRequest, conversationController.getMessage);
conversationRouter.get("/user/:userId", authenticateRequest, conversationController.userChats);
conversationRouter.get("/find/:firstId/:secondId", authenticateRequest, conversationController.findChat)
conversationRouter.get("/:chatId", authenticateRequest, conversationController.getChat);
conversationRouter.get("/:chatId/messages", authenticateRequest, conversationController.getChatMessages);

export default conversationRouter;

