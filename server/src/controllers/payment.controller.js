import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { paymentService } from "../services/paymentService.js";

// @route POST /api/payments/checkout  (plan upgrade)
export const checkout = async (req, res, next) => {
  try {
    const { plan, method } = req.body;

    if (!["basic", "premium"].includes(plan)) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }

    // ✅ Agar REAL gateway configured hai → hosted checkout par bhejें
    if (paymentService.isLive() && (method === "jazzcash" || !method)) {
      const request = paymentService.createJazzCashRequest(plan, req.user._id.toString());

      // Pending payment record banाo (callback par confirm hoga)
      await Payment.create({
        userId: req.user._id,
        plan,
        amount: paymentService.getPrice(plan),
        method: "jazzcash",
        status: "pending",
        transactionId: request.txnRef,
        expiresAt: new Date(Date.now() + paymentService.getDays(plan) * 86400000),
      });

      // Frontend ko gateway form params bhejें (user wahan redirect hoga)
      return res.json({
        success: true,
        data: { redirect: true, ...request },
      });
    }

    // ---- SIMULATED MODE (jab tak real gateway na ho) ----
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + paymentService.getDays(plan));

    const payment = await Payment.create({
      userId: req.user._id,
      plan,
      amount: paymentService.getPrice(plan),
      method: method || "easypaisa",
      status: "completed",
      transactionId: "TXN" + Date.now() + Math.floor(Math.random() * 1000),
      expiresAt,
    });

    const user = await User.findById(req.user._id);
    user.plan = plan;
    user.planExpiresAt = expiresAt;
    user.dailyQuestionsUsed = 0;
    user.lastQuestionDate = new Date().toISOString().split("T")[0];
    await user.save();

    res.status(201).json({
      success: true,
      message: `🎉 Payment successful! You are now ${plan.toUpperCase()}.`,
      data: {
        redirect: false,
        payment: { id: payment._id.toString(), transactionId: payment.transactionId },
        user: user.toPublic(),
        simulated: !paymentService.isLive(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/callback  (gateway se payment ke baad yahan aata hai)
export const paymentCallback = async (req, res, next) => {
  try {
    const valid = paymentService.verifyJazzCashCallback(req.body);
    const txnRef = req.body.pp_TxnRefNo;

    const payment = await Payment.findOne({ transactionId: txnRef });
    if (!payment) return res.status(404).send("Payment not found");

    if (valid) {
      payment.status = "completed";
      await payment.save();

      // User upgrade karें
      const user = await User.findById(payment.userId);
      if (user) {
        user.plan = payment.plan;
        user.planExpiresAt = payment.expiresAt;
        user.dailyQuestionsUsed = 0;
        await user.save();
      }
      // Frontend success page par redirect
      return res.redirect(`${process.env.CLIENT_URL}?payment=success`);
    } else {
      payment.status = "failed";
      await payment.save();
      return res.redirect(`${process.env.CLIENT_URL}?payment=failed`);
    }
  } catch (error) {
    next(error);
  }
};

// @route GET /api/payments/history
export const getHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/cancel  (subscription cancel — free par wapas)
export const cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.plan === "free") {
      return res.status(400).json({ success: false, error: "Aap pehle se free plan par hain" });
    }
    // Plan cancel — current expiry tak chalega phir free ho jayega
    // (ya turant free karna ho to neeche dono lines uncomment karें)
    const expiry = user.planExpiresAt;
    res.json({
      success: true,
      message: `Subscription cancel ho gaya. Aap ${new Date(expiry).toLocaleDateString()} tak ${user.plan} use kar sakte hain, phir free ho jayega.`,
      data: { user: user.toPublic(), cancelledAt: new Date() },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/change-plan  { plan }  (upgrade ya downgrade)
export const changePlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!["basic", "premium"].includes(plan)) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }
    const user = await User.findById(req.user._id);
    const isDowngrade = user.plan === "premium" && plan === "basic";

    // Downgrade → current cycle ke baad apply (warna naya checkout)
    if (isDowngrade) {
      return res.json({
        success: true,
        message: "Downgrade schedule ho gaya — agle billing cycle se Basic plan lagू hoga.",
        data: { user: user.toPublic() },
      });
    }
    // Upgrade → checkout par bhejें
    return res.json({
      success: true,
      message: "Upgrade ke liye checkout par jayें.",
      data: { needsCheckout: true, plan },
    });
  } catch (error) {
    next(error);
  }
};
