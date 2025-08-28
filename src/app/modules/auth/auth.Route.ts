import express from "express";
import { AuthControllers } from "./auth.controller";

const router = express.Router();

router.post("/login", AuthControllers.userLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken)

export const AuthRouter = router;
