import { Types } from "mongoose";

/* eslint-disable no-unused-vars */
export enum Role {
    SENDER = "SENDER",
    RECEIVER = "RECEIVER",
    ADMIN = "ADMIN",
}

export interface IAuths {
    provider: "google" | "credentials";
    providerId: string;
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    role: Role;
    address?: string;
    phone?: string;
    auths: IAuths[];
    isBlocked?: boolean;
}
