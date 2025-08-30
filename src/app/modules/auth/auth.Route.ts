import express, { NextFunction, Request, Response } from "express";
import { AuthControllers } from "./auth.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import passport from "passport";

const router = express.Router();

router.post("/login", AuthControllers.userLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.userLogOut);
router.post(
    "/change-password",
    checkAuth(...Object.values(Role)),
    AuthControllers.changePassword
);

router.get(
    "/google",

    async (req: Request, res: Response, next: NextFunction) => {
        const redirect = req.query.redirect || "/";
        passport.authenticate("google", {
            scope: ["profile", "email"],
            state: redirect as string,
        })(req, res, next);
    }
);

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    AuthControllers.googleCallbackController
);

export const AuthRouter = router;
