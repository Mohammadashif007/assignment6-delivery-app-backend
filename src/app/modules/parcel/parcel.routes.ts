import express from "express";
import { ParcelControllers } from "./parcel.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createParcelZodSchema } from "./parcel.validation";

import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = express.Router();

// ! create new parcel
router.post(
    "/",
    checkAuth(Role.SENDER),
    validateRequest(createParcelZodSchema),
    ParcelControllers.createParcel
);

// ! get all parcel
router.get("/me", checkAuth(Role.SENDER), ParcelControllers.getAllMyParcel);

// ! cancel parcel
router.patch(
    "/cancel/:id",
    checkAuth(Role.ADMIN, Role.SENDER),
    ParcelControllers.cancelParcel
);

// ! dispatch parcel
router.patch(
    "/dispatch/:id",
    checkAuth(Role.ADMIN),
    ParcelControllers.parcelDispatch
);

// ! parcel in transit
router.patch(
    "/in-transit/:id",
    checkAuth(Role.ADMIN),
    ParcelControllers.parcelInTransit
);

// ! parcel in out for delivery
router.patch(
    "/out-for-delivery/:id",
    checkAuth(Role.ADMIN),
    ParcelControllers.parcelOUtForDelivery
);

// ! parcel delivered
// router.patch("/delivered/:id", ParcelControllers.parcelDelivered);

// ! confirm parcel delivered (receiver)
router.patch(
    "/confirm-delivery/:id",
    checkAuth(Role.RECEIVER),
    ParcelControllers.confirmDelivery
);

// ! get parcel status log
router.get(
    "/:id/status-log",
    checkAuth(Role.ADMIN, Role.SENDER, Role.RECEIVER),
    ParcelControllers.statusLog
);

// ! get incoming parcels (RECEIVER)
router.get(
    "/incoming",
    checkAuth(Role.RECEIVER),
    ParcelControllers.getIncomingParcels
);

// ! delivery history for (RECEIVER)
router.get(
    "/history",
    checkAuth(Role.RECEIVER),
    ParcelControllers.getDeliveryHistory
);

// ! get all parcel (ADMIN)
router.get("/admin",
     checkAuth(Role.ADMIN), 
     ParcelControllers.getAllParcelsByAdmin);

// ! block parcel by (ADMIN)
router.patch(
    "/block/:parcelId",
    checkAuth(Role.ADMIN),
    ParcelControllers.blockParcel
);

// ! unblock parcel by (ADMIN)
router.patch( 
    "/unblock/:parcelId",
    checkAuth(Role.ADMIN),
    ParcelControllers.unblockParcel
);

// ! track parcel by trackingId
router.get(
    "/track/:trackingId",
    // checkAuth(Role.SENDER, Role.RECEIVER, Role.ADMIN),
    ParcelControllers.trackParcel
);

export const ParcelRoutes = router;
