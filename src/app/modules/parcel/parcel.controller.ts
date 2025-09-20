import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ParcelServices } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

// ! create parcel
const createParcel = catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.userId;
    const result = await ParcelServices.createParcelIntoDB({
        ...req.body,
        senderId,
    });
    sendResponse(res, {
        success: true,
        message: "Parcel created successfully",
        statusCode: httpStatus.CREATED,
        data: result,
    });
});

// ! retrieve sender own parcel
const getAllMyParcel = catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.userId;
    const result = await ParcelServices.getMyParcelFromDB(senderId);
    sendResponse(res, {
        success: true,
        message: "All parcel retrieve successfully",
        statusCode: httpStatus.OK,
        data: result,
    });
});

// ! cancel parcel
const cancelParcel = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ParcelServices.cancelParcelFromDB(id);
    sendResponse(res, {
        success: true,
        message: "Parcel cancelled successfully",
        statusCode: httpStatus.OK,
        data: result,
    });
});

// ! show parcel status log
const statusLog = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ParcelServices.getStatusLog(
        id,
        req.user as JwtPayload
    );
    sendResponse(res, {
        success: true,
        message: "Status log showed successfully",
        statusCode: httpStatus.OK,
        data: result,
    });
});

// ! parcel dispatch
const parcelDispatch = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedBy = req.user?.role;
    const result = await ParcelServices.dispatchParcelFromDB(id, updatedBy);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Parcel dispatched successfully",
        data: result,
    });
});

// ! parcel in transit
const parcelInTransit = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedBy = req.user?.role;
    const result = await ParcelServices.parcelInTransitFromDB(id, updatedBy);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Parcel marked as IN_TRANSIT successfully",
        data: result,
    });
});

// ! parcel out for delivery
const parcelOUtForDelivery = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // const updatedBy = req.user?.email || "ADMIN";
    const updatedBy = "ADMIN";
    const result = await ParcelServices.parcelOutForDelivery(id, updatedBy);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Parcel is out for delivery",
        data: result,
    });
});

// ! confirm parcel delivered by (receiver)
const confirmDelivery = catchAsync(async (req: Request, res: Response) => {
    const receiverId = req.user?.userId;
    const { id } = req.params;
    const result = await ParcelServices.confirmParcelDelivery(id, receiverId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Parcel marked as delivered",
        data: result,
    });
});

// ! incoming parcel (RECEIVER)
const getIncomingParcels = catchAsync(async (req: Request, res: Response) => {
    const receiverId = req.user?.userId;
    const result = await ParcelServices.findIncomingParcels(receiverId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Incoming parcels retrieved successfully",
        data: result,
    });
});

// ! Delivery history (RECEIVER)
const getDeliveryHistory = catchAsync(async (req: Request, res: Response) => {
    const receiverId = req.user?.userId;
    const result = await ParcelServices.findDeliveredParcels(receiverId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Delivery history retrieve successfully",
        data: result,
    });
});

// ! Get all parcel (ADMIN)
const getAllParcelsByAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await ParcelServices.getAllParcelsByAdminFromDB();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All parcels retrieved successfully",
        data: result,
    });
});

// ! block parcel by (ADMIN)
const blockParcel = catchAsync(async (req: Request, res: Response) => {
    const { parcelId } = req.params;
    const result = await ParcelServices.blockParcelsByAdmin(parcelId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All parcels retrieved successfully",
        data: result,
    });
});

// ! unblock parcel by (ADMIN)
const unblockParcel = catchAsync(async (req: Request, res: Response) => {
    const { parcelId } = req.params;
    const result = await ParcelServices.unblockParcelsByAdmin(parcelId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All parcels retrieved successfully",
        data: result,
    });
});

//! track parcel by trackingId
const trackParcel = catchAsync(async (req: Request, res: Response) => {
    const { trackingId } = req.params;
    const result = await ParcelServices.trackParcel(trackingId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Parcel tracking info retrieve successfully",
        data: result,
    });
});

export const ParcelControllers = {
    createParcel,
    getAllMyParcel,
    cancelParcel,
    statusLog,
    parcelDispatch,
    parcelInTransit,
    parcelOUtForDelivery,
    confirmDelivery,
    getIncomingParcels,
    getDeliveryHistory,
    getAllParcelsByAdmin,
    blockParcel,
    unblockParcel,
    trackParcel,
};
