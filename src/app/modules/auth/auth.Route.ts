import express from "express";
import { AuthControllers } from "./auth.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";


const router = express.Router();

router.post("/login", AuthControllers.userLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.userLogOut);
router.post(
    "/change-password",
    checkAuth(...Object.values(Role)),
    AuthControllers.changePassword
);

export const AuthRouter = router;
