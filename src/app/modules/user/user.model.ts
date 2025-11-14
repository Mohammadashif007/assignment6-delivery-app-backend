import { model, Schema } from "mongoose";
import { IAuths, IUser, Role } from "./user.interface";

const authsSchema = new Schema<IAuths>(
    {
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
    },
    { versionKey: false, _id: false }
);

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.SENDER,
            set: (value: string) => value?.toUpperCase(),
        },
        address: { type: String },
        auths: [authsSchema],
        phone: { type: String },
        isBlocked: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);



export const User = model<IUser>("User", userSchema);
