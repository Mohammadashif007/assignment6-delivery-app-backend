import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import httpStatus from "http-status-codes";

export const createUserToken = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
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

    return {
        refreshToken,
        accessToken,
    };
};

export const createNewAccessTokenWithRefreshToken = async (
    refreshToken: string
) => {
    const verifiedRefreshToken = verifyToken(
        refreshToken,
        envVars.JWT_REFRESH_SECRET
    ) as JwtPayload;

    const isUserExist = await User.findOne({
        email: verifiedRefreshToken.email,
    });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User dose not exist");
    }

    if (isUserExist.isBlocked) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is blocked");
    }

    const payload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    };

    const accessToken = generateToken(
        payload,
        envVars.JWT_ACCESS_SECRET,
        envVars.JWT_ACCESS_EXPIRES
    );

    return {
        accessToken,
    };
};
