import { Request, Response } from "express";
import { HttpError, httpMethod } from "..";
import Conversation from "@models/Conversation";
import { authenticateRequest } from "@middleware/auth";

export const createConversation = httpMethod(async (req: Request, res: Response) => {
    const data = await authenticateRequest(req, res);
    const chat = await new Conversation({
        members: [data.userId, req.body.receiverId]
    }).save();

    res.status(200).json(chat);
})


export const userChats = httpMethod(async (req: Request, res: Response) => {

    const data = await authenticateRequest(req, res);
    // @ts-ignore
    if (req.params.userId !== data?.userId) {
        throw new HttpError(401, "You are not authorized to access this chat.");
    }
    // const chat = await Conversation.find({
    //     members: { $in: [req.params.userId] }
    // })
    // res.status(200).json({ conversations: chat });
    const chats = await Conversation.find({
        members: { $in: [req.params.userId] }
    }).populate('members', '-password');

    // Extract userIds from the conversations
    const userIds = chats.reduce((acc, chat) => {
        // @ts-ignore
        return acc.concat(chat.members.map((member) => member._id.toString()));
    }, []);

    // Find about data for the userIds
    // const aboutData = await About.find({ userId: { $in: userIds } });

    // Create a map of userId to about data
    // const aboutDataMap = new Map();
    // aboutData.forEach((about) => {
    //     // @ts-ignore
    //     aboutDataMap.set(about.userId.toString(), about);
    // });

    // Append about data to each user in the chat
    // const chatsWithAbout = chats.map((chat) => {
    //     const membersWithAbout = chat.members.map((member) => ({
    //         // @ts-ignore
    //         ...member._doc,
    //         about: aboutDataMap.get(member._id.toString()),
    //     }));
    //     return {
    //         // @ts-ignore
    //         ...chat._doc,
    //         members: membersWithAbout,
    //     };
    // });

    res.status(200).json({ conversations: chats });

})



export const sendMessage = httpMethod(async (req: Request, res: Response): Promise<void> => {
    const { chatId } = req.params
    const data = await authenticateRequest(req, res);
    // @ts-ignore
    if (req.body?.senderId !== data?.userId) {
        throw new HttpError(401, "You are not authorized to access this chat.");
    }
    const chat = await Conversation.findById(chatId);
    if (!chat) {
        throw new HttpError(404, "Chat not found!");
    }

    let memberFound: Boolean = false;
    await chat?.members.forEach((member) => {
        if (member.toString() === req.body.senderId) {
            memberFound = true
        }
    })
    if (!memberFound) {
        throw new HttpError(404, "You are not member of this chat!");
    }
    const updatedChat = await Conversation.findByIdAndUpdate(chatId,
        {
            $push: {
                messages: {
                    senderId: req.body.senderId,
                    text: req.body.text
                }
            }
        },
        { new: true })
    const checkChat = await Conversation.findOne({ _id: chatId }, { messages: { $slice: -1 } })
    res.status(200).json(checkChat?.messages[0]); // updatedChat

})


export const findChat = httpMethod(async (req: Request, res: Response) => {

    const chat = await Conversation.find({
        members: { $all: [req.params.firstId, req.params.secondId] }
    })
    res.status(200).json(chat);

})

export const getChatMessages = httpMethod(async (req: Request, res: Response) => {

    const chat = await Conversation.findOne({ _id: req.params.chatId })
    res.status(200).json(chat?.messages);

})

export const getChat = httpMethod(async (req: Request, res: Response) => {

    const chat = await Conversation.findOne({ _id: req.params.chatId })
    res.status(200).json(chat);

})

export const getMessage = httpMethod(async (req: Request, res: Response): Promise<void> => {
    const { chatId, messageId } = req.params

    const chat = await Conversation.find({ _id: chatId, "messages._id": messageId });
    if (!chat) {
        res.status(404).json({ message: "Chat not found!" })
    }
    let memberFound: Boolean = false;
    if (!memberFound) {
        throw new HttpError(404, "You are not member of this chat!");
    }
    const updatedChat = await Conversation.findByIdAndUpdate(chatId,
        {
            $push: {
                messages: {
                    senderId: req.body.senderId,
                    text: req.body.text
                }
            }
        },
        { new: true })
    res.status(200).json(updatedChat);

})