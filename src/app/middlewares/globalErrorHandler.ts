/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Something went wrong!";
    const errorSource: any = [];

    if (err.code === 11000) {
        statusCode = httpStatus.BAD_REQUEST;
        const matchedArray = err.message.match(/"([^"]*)"/);
        message = `${matchedArray[1]} already exists`;
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = "Mongoose castError invalid mongoose _id";
    } else if (err.name === "ValidationError") {
        statusCode = 400;
        const errors = Object.values(err.errors);
        errors.forEach((errorObject: any) =>
            errorSource.push({
                path: errorObject.path,
                message: errorObject.message,
            })
        );
        console.log(errorSource);
        message = "Validation error";
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        statusCode = statusCode as number;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSource,
        // err,
        stack: envVars.NODE_ENV === "development" ? err.stack : null,
    });
};
