import * as yup from "yup";
import { Request } from "express";

// Validation schema for register request
export const validateRegisterRequest = async (req: Request) => {
  const schema = yup.object().shape({
    username: yup.string().required("Username is required"),
    email: yup
      .string()
      .email("Not a valid email")
      .trim()
      .lowercase()
      .required("Email is required"),
    password: yup.string().required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
    phone: yup.string().optional(), // phone is optional
    dob: yup.string().optional(), // dob is optional
    role: yup
      .string()
      .oneOf(["provider", "client", "admin"], "Invalid role")
      .default("provider"), // default is provider, but role is optional
    providerId: yup.string().optional(), // providerId is optional, will be used only for client role
  });

  return schema.validate(req.body, { abortEarly: false });
};

export const validateLoginRequest = async (req: Request) => {
  const schema = yup.object().shape({
    email: yup.string().email("not a valid email").trim().lowercase().required("email is required"),
    password: yup.string().required("password is required")
  })

  return schema.validate(req.body, { abortEarly: false });
}