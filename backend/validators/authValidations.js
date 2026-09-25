import { z } from 'zod';
import validator from 'validator';

export const registerSchema = z.object({
    name: z.string()
        .min(3, { message: "Name must have at least 3 characters" })
        .max(30, { message: "Name must have at most 30 characters" }),
    email: z.email({ message: "Invalid Email Format" }),
    q_id: z.string()
        .length(8, { message: "Invalid Qid" })
        .refine((val) => validator.isNumeric(val), {
            message: "Qid only contains numeric digits"
        }),
    course: z.string()
        .trim()
        .toUpperCase()
        .min(2, { message: "Course name is too short" })
        .max(50, { message: "Course name is too long" }),
    year: z.string()
        .refine((val) => validator.isNumeric(val), {
            message: "Enter the correct Year"
        }),
    section: z.string()
        .refine((val) => validator.isAlphanumeric(val), {
            message: "Enter the valid section"
        }),

    password: z.string()
        .refine((val) => validator.isStrongPassword(val, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }), {
            message: "Password is too weak. Needs 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special character"
        }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"]
})

export const verifySchema = z.object({
    userId: z.string({ required_error: "User ID is required" }).min(1),
    otp: z.string({ required_error: "OTP is required" }).length(6, { message: "OTP must be exactly 6 digits" }),
    type: z.enum(['email'], { errorMap: () => ({ message: "Type must be 'email'" }) }).optional()
});

export const resendSchema = z.object({
    userId: z.string({ required_error: "User ID is required" }).min(1),
    type: z.enum(['email'], { errorMap: () => ({ message: "Type must be 'email'" }) }).optional()
});

export const loginSchema = z.object({
    identifier: z.string({ required_error: "Identifier (Email or Q-ID) is required" }).min(1),
    password: z.string({ required_error: "Password is required" }).min(1)
});

export const forgotSchema = z.object({
    emai: z.email({ message: "Invalid email" })
        .refine({
            required_error: "Email is required"
        })
})

export const resetSchema = z.object({
    emai: z.email({ message: "Invalid email" })
        .refine({
            required_error: "Email is required"
        }),
    otp: z.string()
        .length(6,{
            message:"Invalid OTP"
        })
        .refine(val => validator.isNumeric(val), {
            message: "Invalid OTP"
        }),
    password: z.string()
        .refine((val) => validator.isStrongPassword(val, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }), {
            message: "Password is too weak. Needs 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special character"
        }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"]
})