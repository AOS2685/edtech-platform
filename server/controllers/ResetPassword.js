const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); 

// Reset Password ka token generate kiya.
exports.resetPasswordToken = async (req, res) => {
	try {
        // We send a url to respective mail id
		const email = req.body.email;
		//  Check user for this email , email validation
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
				message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
			});
		}
		// Generate Token
		const token = crypto.randomUUID();
		// update user by adding token and expiration time
		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 5*60*1000,//5 min
			},
			{ new: true } //Updated details is returned
		);
		console.log("DETAILS", updatedDetails);
		// create url
		const url = `http://localhost:3000/update-password/${token}`;

		// Will add it if needed in future
		// const url = `https://studynotion-edtech-project.vercel.app/update-password/${token}`


		// Send mail containing the url
		await mailSender(
			email,
			"Password Reset Link", //subject
			`Your Link for email verification is ${url}. Please click this url to reset your password.` //email body
		);
		// retruning the response
		return res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error.message,
			success: false,
			message: 'Something went wrong while sending the Reset password mail',
		});
	}

};

// Now function to perform reset operation of a password
exports.resetPassword = async (req, res) => {
	try {
		// Fetching data from request body
		const { password, confirmPassword, token } = req.body;
		// Validation of password
		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}
		// Get userdetails from db using token
		const userDetails = await User.findOne({ token: token });
		// If no entry - Invalid token
		if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}
		// Token time Check
		if ((userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}
		// hash password
		const encryptedPassword = await bcrypt.hash(password, 10);
		// Password Update
		await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true },
		);
		//  Return response
		return res.status(200).json({
			success: true,
			message: `Password Reset Successful`,
		});
	}
	catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error.message,
			success: false,
			message: `Some went wrong while sending reset password mail`,
		});
	}
};