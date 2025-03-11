import { Schema, model, InferSchemaType } from "mongoose";


const ConversationSchema = new Schema(
    {
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        ],
        messages: [
            {
                senderId: {
                    type: String
                },
                text: {
                    type: String
                },
                isSeen: {
                    type: Boolean,
                    default: false
                },
                createdAt: { type: Date, default: Date.now },
            }
        ]
    },
    {
        timestamps: true,
    })

export type ConversationType = InferSchemaType<typeof ConversationSchema>;

const Conversation = model<ConversationType>("conversation", ConversationSchema);

export default Conversation;
