import AppError from "../../errorHelpers/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import { envVars } from "../../config/env";

const createUserIntoDB = async (payload: IUser) => {
    const isUserExist = await User.findOne({ email: payload.email });
    if (isUserExist) {
        throw new AppError(httpStatus.FORBIDDEN, "User already exist");
    }
    const hashedPassword = await bcrypt.hash(
        payload.password as string,
        Number(envVars.BCRYPT_SALT_ROUND)
    );
    const authProvider = { provider: "credentials", providerId: payload.email };
    const user = await User.create({
        ...payload,
        password: hashedPassword,
        auths: [authProvider],
    });
    return user;
};

const getAllUsersFromDB = async () => {
    const users = await User.find();
    const totalUsers = await User.countDocuments();
    return { data: users, meta: { total: totalUsers } };
};

const blockUserByAdmin = async (userId: string) => {
    const user = await User.findOne({ _id: userId });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    if (user.isBlocked) {
        throw new AppError(httpStatus.CONFLICT, "User already blocked");
    }
    user.isBlocked = true;
    await user.save();
    return user;
};

const unblockUserByAdmin = async (userId: string) => {
    const user = await User.findOne({ _id: userId });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    if (!user.isBlocked) {
        throw new AppError(httpStatus.CONFLICT, "User already unblocked");
    }
    user.isBlocked = false;
    await user.save();
    return user;
};

export const UserServices = {
    createUserIntoDB,
    getAllUsersFromDB,
    blockUserByAdmin,
    unblockUserByAdmin,
};
