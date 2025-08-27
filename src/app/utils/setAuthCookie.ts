import { Response } from "express";

interface IUserToken {
    accessToken: string;
    refreshToken: string;
}

export const setAuthCookie = (res: Response, userToken: IUserToken) => {
    if (userToken.accessToken) {
        res.cookie("accessToken", userToken.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
    }

    if (userToken.refreshToken) {
        res.cookie("refreshToken", userToken.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
    }
};
