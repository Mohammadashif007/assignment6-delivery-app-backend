/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { setAuthCookie } from "../../utils/setAuthCookie";
import AppError from "../../errorHelpers/AppError";
import { createUserToken } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import passport from "passport";

const userLogin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            "local",
            async (err: any, user: any, info: any) => {
                if (err) {
                    return next(new AppError(400, err));
                }

                if (!user) {
                    return next(new AppError(400, info.message));
                }

                const userToken = createUserToken(user);

                setAuthCookie(res, userToken);

                delete user.toObject().password;

                sendResponse(res, {
                    success: true,
                    message: "User login successfully",
                    statusCode: httpStatus.ACCEPTED,
                    data: {
                        accessToken: userToken.accessToken,
                        refreshToken: userToken.refreshToken,
                        user,
                    },
                });
            }
        )(req, res);

        // const userData = req.body;
        // const userInfo = await AuthServices.userLogin(userData);
    }
);

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received");
    }
    const userToken = await AuthServices.getNewAccessToken(refreshToken);
    setAuthCookie(res, userToken);
    sendResponse(res, {
        success: true,
        message: "New access token retrieve successfully",
        statusCode: httpStatus.ACCEPTED,
        data: userToken,
    });
});

const userLogOut = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
    });

    sendResponse(res, {
        success: true,
        message: "User logged out successfully",
        statusCode: httpStatus.OK,
        data: null,
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { oldPassword, newPassword } = req.body;
    await AuthServices.changePassword(oldPassword, newPassword, userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User changed password successfully",
        data: null,
    });
});

const googleCallbackController = catchAsync(
    async (req: Request, res: Response) => {
        let redirectTo = req.query.state ? (req.query.state as string) : "";

        if (redirectTo.startsWith("/")) {
            redirectTo = redirectTo.slice(1);
        }

        const user = req.user;

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }
        const tokenInfo = createUserToken(user);
        setAuthCookie(res, tokenInfo);
        res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
    }
);

export const AuthControllers = {
    userLogin,
    getNewAccessToken,
    userLogOut,
    changePassword,
    googleCallbackController,
};
