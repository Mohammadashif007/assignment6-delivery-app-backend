/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import { IUser } from "../user/user.interface";
import { createUserToken } from "../../utils/userTokens";

const userLogin = async (payload: Partial<IUser>) => {
    const userExist = await User.findOne({ email: payload.email });

    if (!userExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    const matchPassword = await bcrypt.compare(
        payload.password as string,
        userExist.password
    );
    if (!matchPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid credential");
    }

    const userTokens = createUserToken(userExist);

    const { password, ...rest } = userExist.toObject();

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest,
    };
};

export const AuthServices = {
    userLogin,
};
