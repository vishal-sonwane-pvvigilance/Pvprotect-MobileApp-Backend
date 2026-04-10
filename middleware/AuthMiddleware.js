import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateTokens = (client) => {
  const accessToken = jwt.sign(
    {
      clientId: client.clientId,
      email: client.email,
      adminReference: client.adminReference,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );

  const refreshToken = jwt.sign(
    {
      clientId: client.clientId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );

  return { accessToken, refreshToken };
};