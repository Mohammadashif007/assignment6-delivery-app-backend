import { model, Schema } from "mongoose";
import { IParcel, IStatusLog, ParcelStatus } from "./parcel.interface";

const statusLogSchema = new Schema<IStatusLog>(
    {
        status: {
            type: String,
            enum: Object.values(ParcelStatus),
            required: true,
        },
        timestamp: { type: Date, default: Date.now },
        // updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: String },
        note: { type: String },
    },
    { _id: false }
);

const parcelSchema = new Schema<IParcel>({
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    trackingId: { type: String, unique: true },
    isBlocked: { type: Boolean, default: false },
    senderId: { type: Schema.Types.ObjectId },
    receiverId: { type: Schema.Types.ObjectId, required: true },
    parcelStatus: {
        type: String,
        enum: Object.values(ParcelStatus),
    },
    originalAddress: { type: String, required: true },
    destinationAddress: { type: String, required: true },
    statusLog: [statusLogSchema],
});

export const Parcel = model<IParcel>("Parcel", parcelSchema);
