import express from 'express';
import { loginClient, registerClient } from '../controller/clientUserController.js';
import { ApiError } from '../utils/apiResopnce.js';
import jwt from 'jsonwebtoken';


import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
router.post("/login", loginClient);
router.post("/register" ,registerClient);  // AdminAuthenticateToken

export const AdminAuthenticateToken = (req, res, next) => {
  const token = req.cookies.adminAccessToken;

  if (!token) {
    return next(new ApiError(401, "Access Token Required"));
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.admin = decoded; // Add admin data to request object
    next();
  } catch (error) {
    return next(new ApiError(403, "Invalid Access Token"));
  }
};

export default router;