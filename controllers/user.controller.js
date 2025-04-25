// Models
import { User } from "../models/index.js"
// Node
import crypto from "crypto"
// Mail
import send_mail from "../utils/mail.js"
// JWT
import jwt from "jsonwebtoken"
// Bcryptjs
import bcrypt from "bcryptjs"

// Register
async function user_register(req, res) {
    // Get data
    const { username, email, password } = req.body
    // Validate data
    if (!username?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
            status_code: 400
        })
    }
    try {
        // Check duplicate data
        const is_exists = await User.findOne({ email })
        if (is_exists) {
            return res.status(409).json({
                success: false,
                message: "User is already exists",
                status_code: 409
            })
        }
        // Password hash
        /*
            For password hashing we use mongoose pre hook
        */
        // Generate verification token
        const email_verification_token = crypto.randomBytes(32).toString("hex")
        // Create user
        const user = await User.create({
            username,
            email,
            password,
            email_verification_token
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User is already exists",
                status_code: 409
            })
        }
        // Send email to user
        const text = `Please click on the following link! <a href="localhost:4000/api/v1/user/verify/${email_verification_token}">Click Here</a>`
        await send_mail("Email Verification", text).then((response) => {
            return res.status(201).json({
                success: true,
                message: "User is created sucessfully",
                status_code: 201,
                email: `Verfication email is sent ${response}`
            })
        }).catch((error) => {
            return res.status(201).json({
                success: true,
                message: "User is created sucessfully",
                status_code: 201,
                email: `Verification email is not sent ${error}`
            })
        })
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            error: error?.message,
            message: "Internal server error",
            status_code: error.code || 500,
        })
    }
}

// Verify
async function user_verify(req, res) {
    // Get data
    const { token } = req.params
    // Validate data
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Verification token is required",
            status_code: 400
        })
    }
    try {
        // Verify token
        const user = await User.findOne({ email_verification_token: token })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Verification token is not valid",
                status_code: 400
            })
        }
        // Update data & delete token
        user.email_verification_token = undefined
        user.is_verified = true
        await user.save()
        return res.status(200).json({
            success: true,
            message: "User is verified",
            status_code: 200
        })
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            error: error?.message,
            message: "Internal server error",
            status_code: error.code || 500,
        })
    }
}

// Login
async function user_login(req, res) {
    // Get data
    const { email, password } = req.body
    // Validate data
    if (!email?.trim() || !password?.trim()) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
            status_code: 400
        })
    }
    try {
        // Check user data
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(409).json({
                success: false,
                message: "Invalid user or password",
                status_code: 409
            })
        }
        // Check Password
        const check_password = await bcrypt.compare(password, user.password)
        if (!check_password) {
            return res.status(409).json({
                success: false,
                message: "Invalid user or password",
                status_code: 409
            })
        }
        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        // Set Cookies
        const cookie_option = {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 1000
        }
        res.cookie("access_token", token, cookie_option)

        return res.status(200).json({
            success: true,
            message: "User login successfully",
            status_code: 200,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    access_token: token
                }
            }
        })
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            error: error?.message,
            message: "Internal server error",
            status_code: error.code || 500,
        })
    }
}

// Profile
async function user_profile(req, res) {
    try {
        const user = await User.findOne({ _id: req?.user?.id })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
                status_code: 400
            })
        }
        return res.status(200).json({
            success: true,
            message: "User access successfully",
            status_code: 200,
            data: {
                user
            }
        })
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            error: error?.message,
            message: "Internal server error",
            status_code: error.code || 500,
        })
    }
}

// Logout
async function user_logout(req, res) {
    try {
        res.clearCookie("access_token")
        return res.status(200).json({
            success: true,
            message: "User logout successfully",
            status_code: 200
        })
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            error: error?.message,
            message: "Internal server error",
            status_code: error.code || 500,
        })
    }
}

// Reset Password
async function user_forgot_password(req, res) {
    // Get data
    const { email } = req.body
    // Validate data
    if (!email?.trim()) {
        return res.status(400).json({
            success: false,
            message: "User email is required",
            status_code: 400
        })
    }
    try {
        // Find user
        const is_user = await User.findOne({ email })
        if (!is_user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
                status_code: 400
            })
        }
        // Create token
        const password_reset_token = crypto.randomBytes(32).toString("hex")
        // Sset token and expiry
        is_user.password_reset_token = password_reset_token
        is_user.password_reset_token_expiry = new Date(Date.now() + (10 * 60 * 1000))
        // Save
        await is_user.save()
        // Send email to user
        const text = `Please click on the following link! <a href="localhost:4000/api/v1/user/reset-password/${password_reset_token}">Click Here</a>`
        await send_mail("Forgot Password", text).then((response) => {
            return res.status(200).json({
                success: true,
                message: "Forgot Password email sucessfully",
                status_code: 200,
                email: `Forgot Password email is sent ${response}`
            })
        }).catch((error) => {
            return res.status(error.code || 500).json({
                success: false,
                error: error?.message,
                message: "Internal server error",
                status_code: error.code || 500,
                email: `Forgot Password email is not sent ${error}`
            })
        })
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            error: error?.message,
            message: "Internal server error",
            status_code: error.code || 500,
        })
    }
}

// Forgot Password
async function user_reset_password(req, res) {
    // Get data
    const { reset_token } = req.params
    const { password } = req.body
    // Validate data
    if (!password?.trim() || !reset_token?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Password or Verifcation is required",
            status_code: 400
        })
    }
    try {
        // Find user in database based on verification token and expiry date
        const user = await User.findOne({ password_reset_token: reset_token, password_reset_token_expiry: { $gt: new Date(Date.now()) } })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Token is expire or might be invalid",
                status_code: 400
            })
        }
        // Update password
        user.password = password
        user.password_reset_token = undefined
        user.password_reset_token_expiry = undefined
        // Save user
        await user.save()
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully.",
            status_code: 200,
        })
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            error: error?.message,
            message: "Internal server error",
            status_code: error.code || 500,
        })
    }
}

export {
    user_register,
    user_verify,
    user_login,
    user_profile,
    user_logout,
    user_forgot_password,
    user_reset_password
}