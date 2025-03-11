import { Router } from "express";
import * as conversationController from "@controllers/conversation";

const conversationRouter = Router();

conversationRouter.post("/",conversationController.createConversation);
conversationRouter.post("/:chatId/message", conversationController.sendMessage);
conversationRouter.get("/:chatId/message/:messageId", conversationController.getMessage);
conversationRouter.get("/user/:userId", conversationController.userChats);
conversationRouter.get("/find/:firstId/:secondId", conversationController.findChat)
conversationRouter.get("/:chatId", conversationController.getChat);
conversationRouter.get("/:chatId/messages", conversationController.getChatMessages);

export default conversationRouter;

