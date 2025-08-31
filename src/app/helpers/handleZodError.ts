/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

export const handleZodError = (err: any): TGenericErrorResponse => {
    const errorSource: TErrorSources[] = [];
    err.issues.forEach((issue: any) => {
        errorSource.push({ path: issue.path[0], message: issue.message });
    });

    return {
        statusCode: 400,
        message: "Zod Error",
        errorSource,
    };
};