import express from "express";
import {
  upsertPreference,
  getPreference,
} from "../controllers/preferenceController.js";

const router = express.Router();

router.put("/users/:userId/preferences", upsertPreference); 
router.get("/users/:userId/preferences", getPreference);   

export default router;
