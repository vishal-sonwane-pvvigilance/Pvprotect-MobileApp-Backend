import express from "express";
import { registerOrLoginUser, verifyOtp } from "../controller/userController.js";

const router = express.Router();


router.post("/login", async (req, res) => {
  const result = await registerOrLoginUser(req.body);
  res.json(result);
});

router.post("/verify-otp", async (req, res) => {
  const result = await verifyOtp(req.body);
  res.json(result);
});

export default router;
