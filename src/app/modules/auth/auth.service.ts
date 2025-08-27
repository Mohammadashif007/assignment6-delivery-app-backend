/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import { IUser } from "../user/user.interface";
import { envVars } from "../../config/env";
import { generateToken } from "../../utils/jwt";

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

    const jwtPayload = {
        userId: userExist._id,
        email: userExist.email,
        role: userExist.role,
    };

    const accessToken = generateToken(
        jwtPayload,
        envVars.JWT_ACCESS_SECRET,
        envVars.JWT_ACCESS_EXPIRES
    );

    const refreshToken = generateToken(
        jwtPayload,
        envVars.JWT_REFRESH_SECRET,
        envVars.JWT_REFRESH_EXPIRES
    );

    const { password, ...rest } = userExist.toObject();

    return {
        accessToken,
        refreshToken,
        user: rest,
    };
};

export const AuthServices = {
    userLogin,
};
