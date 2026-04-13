import { v4 as uuidv4 } from "uuid";
import { ddbDocClient as dynamo } from "../config/dynamoClient.js";
import {
    PutCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "Plants";

// CREATE PLANT
export const createPlant = async (req, res) => {
    try {
        const plant = {
            plant_id: uuidv4(),
            ...req.body,
            status_updated_at: new Date().toISOString(),
        };

        await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: plant }));

        res.status(201).json({
            success: true,
            message: "Plant created successfully",
            data: plant,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL PLANTS (admin only)
export const getPlants = async (req, res) => {
    try {
        const data = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }));

        res.status(200).json({
            success: true,
            count: data.Items?.length || 0,
            data: data.Items,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export const getPlantsByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;
        // console.log("clientId →", clientId);

        // const allData = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }));
        // console.log("ALL PLANTS →", JSON.stringify(allData.Items, null, 2));

        const params = {
            TableName: TABLE_NAME,
            FilterExpression: "clientId = :clientId", ExpressionAttributeValues: {
                ":clientId": clientId,
            },
        };

        const data = await dynamo.send(new ScanCommand(params));

        res.status(200).json({
            success: true,
            data: data.Items,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// UPDATE PLANT
export const updatePlant = async (req, res) => {
    try {
        const { id } = req.params;

        const params = {
            TableName: TABLE_NAME,
            Key: { plant_id: id },
            UpdateExpression: "SET #data = :data, status_updated_at = :time",
            ExpressionAttributeNames: { "#data": "data" },
            ExpressionAttributeValues: {
                ":data": req.body,
                ":time": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
        };

        const result = await dynamo.send(new UpdateCommand(params));

        res.status(200).json({
            success: true,
            message: "Plant updated successfully",
            data: result.Attributes,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE PLANT
export const deletePlant = async (req, res) => {
    try {
        const { id } = req.params;

        await dynamo.send(
            new DeleteCommand({ TableName: TABLE_NAME, Key: { plant_id: id } })
        );

        res.status(200).json({
            success: true,
            message: "Plant deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};