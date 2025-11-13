import { v4 } from "uuid";
import { IParcel, ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";
import { searchableFields } from "./parcel.constant";

// ! create parcel
const createParcelIntoDB = async (payload: IParcel) => {
    const trackingId = `TRK-${v4().split("-")[0].toUpperCase()}`;

    const { weight } = payload;
    const weightNum = parseFloat(weight);
    const totalPrice = weightNum * 200;
    const result = await Parcel.create({
        ...payload,
        price: totalPrice,
        trackingId,
        parcelStatus: ParcelStatus.PENDING,
        statusLog: [
            {
                status: ParcelStatus.PENDING,
                timeStamp: new Date(),
                updatedBy: "SYSTEM",
                note: "Parcel created",
            },
        ],
    });
    return result;
};

// ! retrieve parcel
const getMyParcelFromDB = async (senderId: string) => {
    const result = await Parcel.find({ senderId });
    if (result.length === 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "No parcel found for this sender"
        );
    }
    return result;
};

// ! cancel parcel
const cancelParcelFromDB = async (id: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.BAD_REQUEST, "Parcel not found");
    }
    if (parcel.parcelStatus !== ParcelStatus.PENDING) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only pending parcels can be cancelled"
        );
    }
    parcel.parcelStatus = ParcelStatus.CANCEL;
    parcel.statusLog?.push({
        status: ParcelStatus.CANCEL,
        timestamp: new Date(),
        updatedBy: "SYSTEM",
        note: "Cancelled without auth",
    });
    await parcel.save();
    return parcel;
};

// ! show status log
const getStatusLog = async (id: string, user: JwtPayload) => {
    const parcel = await Parcel.findById(id).select("statusLog");
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    const userId = user.userId;
    const userRole = user.role;
    const isSender = parcel.senderId?.toString() === userId;
    const isReceiver = parcel.receiverId?.toString() === userId;
    const isAdmin = userRole === Role.ADMIN;
    if (!isSender && isReceiver && isAdmin) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "You are not authorized to view this status log"
        );
    }

    return parcel;
};

// ! dispatch Parcel
const dispatchParcelFromDB = async (id: string, updatedBy: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }
    if (parcel.parcelStatus !== ParcelStatus.PENDING) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only pending parcels can be dispatched"
        );
    }

    parcel.parcelStatus = ParcelStatus.DISPATCH;
    parcel.statusLog?.push({
        status: ParcelStatus.DISPATCH,
        timestamp: new Date(),
        updatedBy: updatedBy || "ADMIN",
        note: "Parcel dispatched from warehouse",
    });

    await parcel.save();
    return parcel;
};

// ! parcel in transit
const parcelInTransitFromDB = async (id: string, updatedBy: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    //! If already IN_TRANSIT, return early
    if (parcel.parcelStatus === ParcelStatus.IN_TRANSIT) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "This parcel is already marked as IN_TRANSIT"
        );
    }

    //! If not DISPATCH,
    if (parcel.parcelStatus !== ParcelStatus.DISPATCH) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Parcel must be DISPATCHED before marking as IN_TRANSIT"
        );
    }

    parcel.parcelStatus = ParcelStatus.IN_TRANSIT;
    parcel.statusLog?.push({
        status: ParcelStatus.IN_TRANSIT,
        timestamp: new Date(),
        updatedBy: updatedBy || "ADMIN",
        note: "Parcel is in transit",
    });

    await parcel.save();
    return parcel;
};

// ! parcel OUT_FOR_DELIVERY
const parcelOutForDelivery = async (id: string, updatedBy: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    //! Prevent duplicate status update
    if (parcel.parcelStatus === ParcelStatus.OUT_FOR_DELIVERY) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Parcel is already marked as OUT_FOR_DELIVERY"
        );
    }

    //! Ensure valid state transition
    if (parcel.parcelStatus !== ParcelStatus.IN_TRANSIT) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Parcel must be IN TRANSIT before marking as OUT_FOR_DELIVERY"
        );
    }

    parcel.parcelStatus = ParcelStatus.OUT_FOR_DELIVERY;
    parcel.statusLog?.push({
        status: ParcelStatus.OUT_FOR_DELIVERY,
        timestamp: new Date(),
        updatedBy: updatedBy || "ADMIN",
        note: "Parcel is out for delivery",
    });
    await parcel.save();
    return parcel;
};

//! confirm delivered by (receiver)
const confirmParcelDelivery = async (id: string, receiverId: string) => {
    const parcel = await Parcel.findById(id);

    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    if (parcel.receiverId.toString() !== receiverId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not the receiver");
    }

    if (parcel.parcelStatus !== ParcelStatus.OUT_FOR_DELIVERY) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Parcel must be OUT_FOR_DELIVERY to confirm"
        );
    }

    parcel.parcelStatus = ParcelStatus.DELIVERED;
    parcel.statusLog?.push({
        status: ParcelStatus.DELIVERED,
        timestamp: new Date(),
        updatedBy: receiverId,
        note: "Parcel received by receiver",
    });

    await parcel.save();
    return parcel;
};

// ! check incoming parcel (RECEIVER)
const findIncomingParcels = async (receiverId: string) => {
    const parcel = await Parcel.find({
        receiverId,
        parcelStatus: { $ne: ParcelStatus.DELIVERED },
    });

    if (parcel.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, "No incoming parcel exist");
    }

    return parcel;
};

// ! delivery history
const findDeliveredParcels = async (receiverId: string) => {
    return await Parcel.find({
        receiverId,
        parcelStatus: ParcelStatus.DELIVERED,
    });
};

// ! get all parcel (ADMIN)
const getAllParcelsByAdminFromDB = async (query: Record<string, string>) => {
    const filter = query;
    const searchTerm = query.searchTerm || "";

    delete filter["searchTerm"];
    // ! search for parcel
    const searchQuery = {
        $or: searchableFields.map((field) => ({
            [field]: { $regex: searchTerm, $options: "i" },
        })),
    };

    // ! get all parcel
    const parcels = await Parcel.find(searchQuery)
        .find(filter).sort({})
        .populate("senderId receiverId");

    // ! get total count
    const total = await Parcel.countDocuments(searchQuery);

    return {
        metaData: {
            total: total,
        },
        parcelData: parcels,
    };
};

// ! parcel block by (ADMIN)
const blockParcelsByAdmin = async (parcelId: string) => {
    const parcel = await Parcel.findOne({ _id: parcelId });
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }
    if (parcel.isBlocked) {
        throw new AppError(httpStatus.CONFLICT, "Parcel already blocked");
    }
    parcel.isBlocked = true;
    await parcel.save();
    return parcel;
};

// ! parcel unblock by (ADMIN)
const unblockParcelsByAdmin = async (parcelId: string) => {
    const parcel = await Parcel.findOne({ _id: parcelId });
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }
    if (!parcel.isBlocked) {
        throw new AppError(httpStatus.CONFLICT, "Parcel already unblocked");
    }
    parcel.isBlocked = false;
    await parcel.save();
    return parcel;
};

// ! track parcel by trackingId
const trackParcel = async (trackingId: string) => {
    const parcel = await Parcel.findOne({ trackingId }).populate(
        "senderId receiverId"
    );
    if (!parcel) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Parcel not found for this tracking id"
        );
    }
    return parcel;
};

export const ParcelServices = {
    createParcelIntoDB,
    getMyParcelFromDB,
    cancelParcelFromDB,
    getStatusLog,
    dispatchParcelFromDB,
    parcelInTransitFromDB,
    parcelOutForDelivery,
    confirmParcelDelivery,
    findIncomingParcels,
    findDeliveredParcels,
    getAllParcelsByAdminFromDB,
    blockParcelsByAdmin,
    unblockParcelsByAdmin,
    trackParcel,
};
