// ============================================
// REAL PAYMENT SERVICE — EasyPaisa / JazzCash
// Pakistan ke gateways ke saath integration
//
// ⚠️ ZAROORI: Yeh tabhi kaam karega jab aap ke paas
// EasyPaisa/JazzCash ka MERCHANT ACCOUNT ho aur
// .env mein credentials daalें. Warna "simulated" rahega.
// ============================================

import crypto from "crypto";

const PLAN_PRICES = { basic: 1500, premium: 2800 };
const PLAN_DAYS = { basic: 15, premium: 30 };

// JazzCash credentials (merchant portal se milti hain)
const JAZZCASH = {
  merchantId: process.env.JAZZCASH_MERCHANT_ID,
  password: process.env.JAZZCASH_PASSWORD,
  integritySalt: process.env.JAZZCASH_SALT,
  returnUrl: process.env.JAZZCASH_RETURN_URL,
};

// EasyPaisa credentials
const EASYPAISA = {
  storeId: process.env.EASYPAISA_STORE_ID,
  hashKey: process.env.EASYPAISA_HASH_KEY,
};

export const paymentService = {
  // Kya real payment configured hai?
  isLive: () =>
    Boolean(JAZZCASH.merchantId && JAZZCASH.password) ||
    Boolean(EASYPAISA.storeId),

  getPrice: (plan) => PLAN_PRICES[plan],
  getDays: (plan) => PLAN_DAYS[plan],

  // ---- JazzCash payment request banाo ----
  // JazzCash hosted-checkout form ke liye signed params banata hai
  createJazzCashRequest(plan, userId) {
    const amount = PLAN_PRICES[plan] * 100; // paisa mein
    const txnRef = "T" + Date.now();
    const now = new Date();
    const fmt = (d) =>
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0") +
      String(d.getHours()).padStart(2, "0") +
      String(d.getMinutes()).padStart(2, "0") +
      String(d.getSeconds()).padStart(2, "0");
    const expiry = new Date(now.getTime() + 60 * 60 * 1000);

    const params = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: JAZZCASH.merchantId,
      pp_Password: JAZZCASH.password,
      pp_TxnRefNo: txnRef,
      pp_Amount: String(amount),
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: fmt(now),
      pp_TxnExpiryDateTime: fmt(expiry),
      pp_BillReference: "edubot-" + userId,
      pp_Description: `EduBot ${plan} plan`,
      pp_ReturnURL: JAZZCASH.returnUrl,
    };

    // Secure hash (integrity salt ke saath) — tampering se bachao
    const sorted = Object.keys(params).sort().map((k) => params[k]);
    const hashStr = JAZZCASH.integritySalt + "&" + sorted.join("&");
    params.pp_SecureHash = crypto
      .createHmac("sha256", JAZZCASH.integritySalt)
      .update(hashStr)
      .digest("hex")
      .toUpperCase();

    return {
      gateway: "jazzcash",
      actionUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform",
      params,
      txnRef,
    };
  },

  // JazzCash callback verify (payment ke baad)
  verifyJazzCashCallback(body) {
    const received = body.pp_SecureHash;
    const copy = { ...body };
    delete copy.pp_SecureHash;
    const sorted = Object.keys(copy).sort().map((k) => copy[k]);
    const hashStr = JAZZCASH.integritySalt + "&" + sorted.join("&");
    const expected = crypto
      .createHmac("sha256", JAZZCASH.integritySalt)
      .update(hashStr)
      .digest("hex")
      .toUpperCase();
    return received === expected && body.pp_ResponseCode === "000";
  },
};
