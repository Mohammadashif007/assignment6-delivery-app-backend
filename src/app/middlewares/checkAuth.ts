import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";

export const checkAuth =
    (...authRoles: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToke =
                req.headers.authorization || req.cookies?.accessToken;
            if (!accessToke) {
                throw new AppError(
                    httpStatus.NOT_FOUND,
                    "You are not authorized"
                );
            }


            const verifiedToken = verifyToken(
                accessToke,
                envVars.JWT_ACCESS_SECRET
            ) as JwtPayload;

            if (!authRoles.includes(verifiedToken.role)) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    "You are not authorized"
                );
            }
            req.user = verifiedToken;
            next();
        } catch (error) {
            next(error);
        }
    };
