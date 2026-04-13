import express from "express";
const router = express.Router();

import {
  createPlant,
  getPlants,
  getPlantsByClientId,
  updatePlant,
  deletePlant,
} from "../controller/plantcontroller.js";

import { protectClient } from "../middleware/AuthMiddleware.js";

router.post("/plants", createPlant);
router.get("/plantsss", getPlants);                                    // admin — no middleware

router.get("/client/:clientId/plants", getPlantsByClientId); // no middleware needed, clientId from URL

router.put("/plants/:id", updatePlant);
router.delete("/plants/:id", deletePlant);

export default router;