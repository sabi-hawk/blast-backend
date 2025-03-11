import * as yup from "yup";
import { Request } from "express";

export const validateRegisterRequest = async (req: Request) => {

  const schema = yup.object().shape({
    username: yup.string().required("username is required"),
    email: yup.string().email("not a valid email").trim().lowercase().required("email is required"),
    password: yup.string().required("password is required"),
  })
  return schema.validate(req.body, { abortEarly: false })
}

export const validateLoginRequest = async (req: Request) => {
  const schema = yup.object().shape({
    email: yup.string().email("not a valid email").trim().lowercase().required("email is required"),
    password: yup.string().required("password is required")
  })

  return schema.validate(req.body, { abortEarly: false });
}