import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = express.Router();

// ! register user
router.post(
    "/register",
    validateRequest(createUserZodSchema),
    UserControllers.createUser
);

// ! get all user by admin
router.get("/", checkAuth(Role.ADMIN), UserControllers.getAllUsers);

// ! block user by admin
router.patch(
    "/block/:userId",
    checkAuth(Role.ADMIN),
    UserControllers.blockUser
);

// ! unblock user by admin
router.patch(
    "/unblock/:userId",
    checkAuth(Role.ADMIN),
    UserControllers.unblockUser
);


// ! get user profile
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)

export const UserRoutes = router;
