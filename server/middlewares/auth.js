// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
// require("dotenv").config();
const User = require("../models/User");

// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from 3 ways :- i) request cookies, ii) body or iii) header
		const token =
			req.cookies?.token ||
			req.body?.token ||
			req.header("Authorization")?.replace("Bearer ", "");
		// console.log("Extracted Token: ", token);

		// If JWT is missing, return 401 Unauthorized recentOtp
		if (!token) {
			return res.status(401).json({
                success: false,
				message: "Token is Missing, Please Log in.",
            });
		}

		// Verify the token
		try {
			// Verifying the JWT using the secret key stored in environment variables
			// const decode = await jwt.verify(token, process.env.JWT_SECRET);
			const decode = jwt.verify(token, process.env.JWT_SECRET);
			console.log(decode);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode; //Attach user data to request object
			next(); //Move to next middleware
		}
		catch (error) {
			// If JWT verification fails, return 401 Unauthorized recentOtp
			return res.status(401).json({
				 success: false,
				 message: "Token is Invalid or expired, Please Log in again.",
				});
		}
		// If JWT is valid, move on to the next middleware or request handler
		// next();
	}
	catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized recentOtp
		console.error("Auth Middleware Error:", error.message);
		return res.status(500).json({
			success: false,
			message: "Internal Server Error while validating the token",
		});
	}
};

// isStudent
exports.isStudent = async (req, res, next) => {
	try{
		if(req.user.accountType !== "Student"){
			return res.status(401).json({
				success:false,
				message:"This is a protected route for Students only.",
			});
		}
		next();
	}

	catch(error){
		return res.status(500).json({
			success:false,
			message:"User role cannot be verified, please try again"
		});
	}
};

// isAdmin
exports.isAdmin = async (req, res, next) => {
	try{
		if(req.user.accountType !== "Admin"){
			return res.status(401).json({
				success:false,
				message:'This is a protected route for Admin only.',
			});
		}
		next();
	}

	catch(error){
		return res.status(500).json({
			success:false,
			message:"User role cannot be verified, please try again"
		})
	}
};

// isInstructor
exports.isInstructor = async (req, res, next) => {
	try{
		// /Need to ensure that user is authenticated before checking role
		if (!req.user){
			return res.status(401).json({
				success:false,
				message:"Unauthorized, Please log in.",
			});
		}

		// Check if user has the 'Instructor' role
		if(req.user.accountType !== "Instructor"){
			return res.status(403).json({
				success:false,
				message:'This is a protected route for Instructor only.',
			});
		}
		next(); //Moving to next middleware or router handler
	}

	catch(error){
		console.error("Error in isInstructor middleware:",error.message);
		return res.status(500).json({
			success:false,
			message:"User role cannot be verified, please try again",
		});
	}
};