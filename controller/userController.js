import { ddbDocClient } from "../config/dynamoClient.js";
import { PutCommand, UpdateCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import sendotpMail from "../utils/sendOtpMail.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const TableName = "User";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) =>
  jwt.sign(
    { clientId: user.clientId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const getUserByEmail = async (email) => {
  const res = await ddbDocClient.send(new QueryCommand({
    TableName,
    IndexName: "email-index", // ← ensure this GSI exists in DynamoDB
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: { ":e": email }
  }));
  return res.Items?.[0] || null;
};

/* ─── STEP 2: Check user & decide flow ─── */
export const registerOrLoginUser = async (payload) => {
  try {
    const { name, contact, email } = payload;

    if (!email) return { success: false, message: "Email is required" };

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      // ✅ Verified user → direct login
      if (existingUser.isVerified) {
        const token = generateToken(existingUser);
        return {
          success: true,
          login: true,
          token,
          data: existingUser
        };
      }

      // ⚠️ Unverified user → resend OTP, don't login
      const generatedOTP = generateOTP();
      const otpExpiry = Date.now() + 5 * 60 * 1000;

      await ddbDocClient.send(new UpdateCommand({
        TableName,
        Key: { clientId: existingUser.clientId },
        UpdateExpression: "SET otp = :o, otpExpiry = :e",
        ExpressionAttributeValues: {
          ":o": generatedOTP,
          ":e": otpExpiry
        }
      }));

      await sendotpMail(email, generatedOTP);

      return {
        success: true,
        verifyRequired: true,
        clientId: existingUser.clientId, // ← return existing clientId
        message: "OTP resent to your email"
      };
    }

    // ❌ New user → create record and send OTP
    const clientId = "pvc" + uuidv4().replace(/-/g, "").substring(0, 9);
    const generatedOTP = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    await ddbDocClient.send(new PutCommand({
      TableName,
      Item: {
        clientId,
        name,
        contact,
        email,
        otp: generatedOTP,
        otpExpiry,
        isVerified: false,
        createdAt: new Date().toISOString()
      }
    }));

    await sendotpMail(email, generatedOTP);

    return {
      success: true,
      verifyRequired: true,
      clientId,
      message: "OTP sent to your email"
    };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ─── STEP 3: Verify OTP ─── */
export const verifyOtp = async (payload) => {
  try {
    const { clientId, otp } = payload;

    if (!clientId || !otp) return { success: false, message: "clientId and OTP are required" };

    const res = await ddbDocClient.send(new GetCommand({
      TableName,
      Key: { clientId }
    }));
    
    const user = res.Item

    if (!user) return { success: false, message: "User not found" };
    if (!user.otp) return { success: false, message: "OTP not generated" };
    if (Date.now() > user.otpExpiry) return { success: false, message: "OTP expired" };
    if (user.otp !== otp) return { success: false, message: "Invalid OTP" };

    // ✅ OTP correct → mark verified, clear OTP
    await ddbDocClient.send(new UpdateCommand({
      TableName,
      Key: { clientId },
      UpdateExpression: "SET isVerified = :v REMOVE otp, otpExpiry",
      ExpressionAttributeValues: { ":v": true }
    }));

    const token = generateToken(user);

    return { success: true, token };

  } catch (error) {
    return { success: false, message: error.message };
  }
};