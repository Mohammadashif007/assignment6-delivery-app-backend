import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { setAuthCookie } from "../../utils/setAuthCookie";

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

export const AuthControllers = {
    userLogin,
};
