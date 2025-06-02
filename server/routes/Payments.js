// Import the required Modules
const express = require("express");
const router = express.Router();

const { capturePayment, verifyPayment, sendPaymentSuccessEmail} = require("../controllers/Payments");
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");

// Capture Payment
router.post("/capturePayment", auth, isStudent, capturePayment);

// Verify Signature
router.post("/verifyPayment",auth, isStudent, verifyPayment);
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail)


module.exports = router;