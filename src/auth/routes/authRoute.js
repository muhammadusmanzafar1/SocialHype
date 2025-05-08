const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../utils/ApiError'); 
const { registerUser, verifyOTP, login } = require('../controllers/authController');
const { registerViaEmail, validateVerifyOTP, loginVerify } = require("../validators/auth");

// Register
router.post("/register/email", async (req, res) => {
    const { error, value } = registerViaEmail.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }

    try {
        const registeredUser = await registerUser(req, res);
        res.status(httpStatus.CREATED).json({ message: "User registered successfully", user: registeredUser });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// VerifyOTP
router.post("/verifyOTP", async (req, res) => {
    const { error, value } = validateVerifyOTP.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }
    try {
        const data = await verifyOTP(req, res);
        res.status(httpStatus.OK).json({ message: "User verified successfully", data: data });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { error, value } = loginVerify.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }

    try {
        const registeredUser = await login(req, res);
        res.status(httpStatus.CREATED).json({ message: "User Login successfully", user: registeredUser });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;