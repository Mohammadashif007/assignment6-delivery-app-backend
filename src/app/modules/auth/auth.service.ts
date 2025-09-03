/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import {
    createNewAccessTokenWithRefreshToken,
} from "../../utils/userTokens";

import { envVars } from "../../config/env";




const getNewAccessToken = async (refreshToken: string) => {
    const accessToken = await createNewAccessTokenWithRefreshToken(
        refreshToken
    );
    return accessToken;
};

const changePassword = async (
    oldPassword: string,
    newPassword: string,
    userId: string
) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password as string);
    if (!isPasswordMatch) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password dose not match");
    }
    const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    );
    user.password = newPassword;
    await user.save();
};

export const AuthServices = {
    getNewAccessToken,
    changePassword,
};
