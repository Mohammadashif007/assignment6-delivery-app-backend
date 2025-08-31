export interface TErrorSources {
    path: string;
    message: string;
}

export interface TGenericErrorResponse {
    statusCode: number;
    message: string;
    errorSource?: TErrorSources[];
}
