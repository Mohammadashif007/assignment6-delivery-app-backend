/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import { IUser } from "../user/user.interface";
import {
    createNewAccessTokenWithRefreshToken,
    createUserToken,
} from "../../utils/userTokens";
import { generateToken, verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

const getNewAccessToken = async (refreshToken: string) => {
    const accessToken = await createNewAccessTokenWithRefreshToken(
        refreshToken
    );
    // const verifiedRefreshToken = verifyToken(
    //     refreshToken,
    //     envVars.JWT_REFRESH_SECRET
    // ) as JwtPayload;

    // const isUserExist = await User.findOne({
    //     email: verifiedRefreshToken.email,
    // });

    // if (!isUserExist) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "User dose not exist");
    // }

    // if (isUserExist.isBlocked) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "User is blocked");
    // }

    // const payload = {
    //     userId: isUserExist._id,
    //     email: isUserExist.email,
    //     role: isUserExist.role,
    // };

    // const accessToken = generateToken(
    //     payload,
    //     envVars.JWT_ACCESS_SECRET,
    //     envVars.JWT_ACCESS_EXPIRES
    // );

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
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
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
    userLogin,
    getNewAccessToken,
    changePassword,
};
