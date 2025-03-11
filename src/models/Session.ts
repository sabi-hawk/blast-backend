import { Schema, model, InferSchemaType } from "mongoose";


const SessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        require: true
    },
    startedAt: {
        type: Date,
        require: true
    },
    expiresAt: {
        type: Date,
        require: true
    },
    accessToken: {
        type: String
    }
}, {
    timestamps: true
})

export type SessionType = InferSchemaType<typeof SessionSchema>;

const Session = model<SessionType>("session", SessionSchema);

export default Session;
