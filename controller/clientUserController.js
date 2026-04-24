import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient as dynamoDb } from "../config/dynamoClient.js";
import { ApiError, ApiResponse } from "../utils/apiResopnce.js";
import { generateTokens } from "../middleware/AuthMiddleware.js";

const ClientsTable = process.env.CLIENTS_TABLE_NAME;
console.log(ClientsTable);

export const registerClient = async (req, res, next) => {
  const { name, email, contact_number, password, adminReference } = req.body;

  if (!name || !email || !contact_number || !password || !adminReference) {
    return next(new ApiError(400, "All fields are required"));
  }

  try {
    let clientId, existingClient;
    do {
      clientId = `pvc${uuidv4().slice(0, 7)}`;
      existingClient = await dynamoDb.send(
        new ScanCommand({
          TableName: ClientsTable,
          FilterExpression: "clientId = :clientId",
          ExpressionAttributeValues: { ":clientId": clientId },
        })
      );
    } while (existingClient.Count > 0);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = {
      clientId,
      name,
      email,
      contact_number,
      password: hashedPassword,
      adminReference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dynamoDb.send(
      new PutCommand({ TableName: ClientsTable, Item: newClient })
    );

    const { accessToken, refreshToken } = generateTokens(newClient);

    res.status(201).json(
      new ApiResponse(
        201,
        {
          clientId,
          name,
          email,
          contact_number,
          adminReference,
          createdAt: newClient.createdAt,
        },
        "Client registered successfully"
      )
    );
  } catch (error) {
    next(new ApiError(500, `Failed to register client: ${error.message}`));
  }
};

// Login Client
export const loginClient = async (req, res, next) => {
  const { clientId, password } = req.body;

  if (!clientId || !password) {
    return next(new ApiError(400, "Client ID and password are required"));
  }

  try {
    const { Items } = await dynamoDb.send(
      new QueryCommand({
        TableName: ClientsTable,
        KeyConditionExpression: "clientId = :clientId",
        ExpressionAttributeValues: { ":clientId": clientId },
      })
    );

    // ✅ FIX 1: Check if client exists first
    if (!Items || Items.length === 0) {
      return next(new ApiError(401, "Invalid Client ID or password"));
    }

    // ✅ FIX 2: Check password separately — prevents fallthrough crash
    const isPasswordValid = await bcrypt.compare(password, Items[0].password);
    if (!isPasswordValid) {
      return next(new ApiError(401, "Invalid Client ID or password"));
    }

    const client = Items[0];
    const { accessToken, refreshToken } = generateTokens(client);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          clientId: client.clientId,
          name: client.name,
          email: client.email,
          contact_number: client.contact_number,
          adminReference: client.adminReference,
          accessToken,
          refreshToken,
        },
        "Client logged in successfully"
      )
    );
  } catch (error) {
    next(new ApiError(500, `Failed to login client: ${error.message}`));
  } 

  
};