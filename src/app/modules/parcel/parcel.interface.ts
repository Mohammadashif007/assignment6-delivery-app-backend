/* eslint-disable no-unused-vars */
import { Types } from "mongoose";

export enum ParcelStatus {
    PENDING = "PENDING",
    DISPATCH = "DISPATCH",
    CANCEL = "CANCEL",
    IN_TRANSIT = "IN_TRANSIT",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
}

export interface IStatusLog {
    status: ParcelStatus;
    timestamp: Date;
    // updatedBy?: Types.ObjectId;
    updatedBy?: string;
    note?: string;
}

export interface IParcel {
    weight: string;
    price?: number;
    trackingId?: string;
    isBlocked?: boolean;
    senderId?: Types.ObjectId;
    receiverId: Types.ObjectId;
    parcelStatus?: ParcelStatus;
    originalAddress: string;
    destinationAddress: string;
    statusLog?: IStatusLog[];
}
