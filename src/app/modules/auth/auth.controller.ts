import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { setAuthCookie } from "../../utils/setAuthCookie";
import AppError from "../../errorHelpers/AppError";

const userLogin = catchAsync(async (req: Request, res: Response) => {
    const userData = req.body;
    const userInfo = await AuthServices.userLogin(userData);
    setAuthCookie(res, userInfo);
    sendResponse(res, {
        success: true,
        message: "User login successfully",
        statusCode: httpStatus.ACCEPTED,
        data: userInfo,
    });
});

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

const changePassword = catchAsync(async(req: Request, res: Response) => {
    const userId = req.user?.userId;
   const {oldPassword, newPassword}  = req.body;
   await AuthServices.changePassword(oldPassword, newPassword, userId);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User changed password successfully",
    data: null
   })

})

export const AuthControllers = {
    userLogin,
    getNewAccessToken,
    userLogOut,
    changePassword
};
