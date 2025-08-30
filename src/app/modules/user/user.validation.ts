import z from "zod";

// ! create user zod validation schema
export const createUserZodSchema = z.object({
    name: z
        .string({ error: "Name must be a string" })
        .min(1, { message: "Name cannot be empty" }),

    email: z
        .string({ error: "Email must be a string" })
        .email({ message: "Invalid email format" }),

    password: z
        .string({ error: "Password must be a string" })
        .min(6, { message: "Password must be at least 6 characters" })
        .optional(),

    role: z.enum(["SENDER", "RECEIVER", "ADMIN"]).optional(),

    phone: z
        .string({ error: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh",
        })
        .optional(),

    address: z.string({ error: "Address must be a string" }).optional(),
});

// ! update user zod validation schema
export const updateUserZodSchema = z.object({
    name: z
        .string({ error: "Name must be a string" })
        .min(1, { message: "Name cannot be empty" })
        .optional(),

    email: z
        .string({ error: "Email must be a string" })
        .email({ message: "Invalid email format" })
        .optional(),

    password: z
        .string({ error: "Password must be a string" })
        .min(6, { message: "Password must be at least 6 characters" })
        .optional(),

    phone: z
        .string({ error: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh",
        })
        .optional(),

    address: z.string({ error: "Address must be a string" }).optional(),
});
