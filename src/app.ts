import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notfound";
import cookieParser from "cookie-parser";

const app = express();

// ! middleware
app.use(cookieParser())
app.use(express.json());
app.use(cors());

// ! application api
app.use("/api/v1", router);

// ! test api
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "welcome to fair haven",
    });
});

// ! global error handler
app.use(globalErrorHandler);

// ! API not found
app.use(notFound);

export default app;
