/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import {
    Strategy as GoogleStrategy,
    Profile,
    VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

passport.use(
    new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email: string, password: string, done: any) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, {
                        message: "Invalid credentials",
                    });
                }

                const isGoogleAuthenticated = user.auths.some(
                    (providerObjects) => providerObjects.provider == "google"
                );

                // if(isGoogleAuthenticated){
                //     return done(null, false, {message: "You have authenticated through google login. If you want to login with credentials than at first you have to login with google and set a password for your gmail and then you can login with gmail and password"})
                // }

                if (isGoogleAuthenticated && !user.password) {
                    return done(
                        "You have authenticated through google login. If you want to login with credentials than at first you have to login with google and set a password for your gmail and then you can login with gmail and password"
                    );
                }

                const hashedPassword = await bcrypt.compare(
                    password,
                    user.password as string
                );

                if (!hashedPassword) {
                    return done(null, false, {
                        message: "Password dose not match",
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL,
        },
        async (
            accessToke: string,
            refreshToken: string,
            profile: Profile,
            done: VerifyCallback
        ) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(null, false, { message: "No email found" });
                }
                const user = await User.create({
                    email,
                    name: profile.displayName,
                    picture: profile.photos?.[0].value,
                    role: Role.SENDER,
                    auths: [{ provider: "google", providerId: profile.id }],
                    isBlocked: false,
                });
                return done(null, user, {
                    message: "User created successfully",
                });
            } catch (error) {
                console.log(error);
                return done(error);
            }
        }
    )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
