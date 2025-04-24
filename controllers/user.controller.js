// Models
import { User } from "../models/index.js"
// Node
import crypto from "crypto"
// Mail
import send_mail from "../utils/mail.js"

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

export {
    user_register,
    user_verify
}