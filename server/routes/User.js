// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers & middleware functions
const{
    login, signup,
    sendotp, changePassword,
} = require("../controllers/Auth");

const {
    resetPasswordToken, resetPassword,
} = require("../controllers/ResetPassword");

const { auth } = require("../middlewares/auth");

// Routes for Login, Signup, and Authentication

// ********************** Authentication Routes **************

// Route for user login
router.post("/login", login);

// Route for user Signup
router.post("/signup", signup);

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp);

// Route for changing the Password
router.post("/changepassword", auth, changePassword);

// ********************* Change Password ************************
// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

// Export the Router for use in the main application
module.exports = router;


