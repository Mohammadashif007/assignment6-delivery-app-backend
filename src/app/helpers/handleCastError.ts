/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleCastError = (
    err: mongoose.Error.CastError
): TGenericErrorResponse => {
    
    return {
        statusCode: 400,
        message: "Mongoose castError invalid mongoose _id...🧨🧨",
    };
};