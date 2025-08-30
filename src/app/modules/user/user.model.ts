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
        role: { type: String, enum: Object.values(Role), default: Role.SENDER },
        address: { type: String },
        auths: [authsSchema],
        phone: { type: String },
        isBlocked: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

// ! password hashing
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(
//         this.password,
//         Number(envVars.BCRYPT_SALT_ROUND)
//     );
//     next();
// });

export const User = model<IUser>("User", userSchema);
