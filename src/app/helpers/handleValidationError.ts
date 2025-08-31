import mongoose from "mongoose";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleValidationError = (
    err: mongoose.Error.ValidationError
): TGenericErrorResponse => {
    const errorSource: TErrorSources[] = [];
    const errors = Object.values(err.errors);
   
    errors.forEach((errorObject: any) =>
        errorSource.push({
            path: errorObject.path,
            message: errorObject.message,
        })
    );
    return {
        statusCode: 400,
        message: "Validation errors",
        errorSource
    };
};