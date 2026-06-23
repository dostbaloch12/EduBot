import express from "express";
import {
  checkout, paymentCallback, getHistory, cancelSubscription, changePlan,
} from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.post("/callback", paymentCallback);
router.get("/history", protect, getHistory);
router.post("/cancel", protect, cancelSubscription);
router.post("/change-plan", protect, changePlan);

export default router;
