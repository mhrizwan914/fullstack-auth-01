// Express
import express from "express"
// Controllers
import {
    user_register,
    user_verify,
    user_login,
    user_profile,
    user_logout,
    user_forgot_password,
    user_reset_password
} from "../controllers/user.controller.js"
// Middleware
import is_logged_in from "../middlewares/auth.middleware.js"

// Create express router
const user_router = express.Router({ caseSensitive: true, strict: true })

// Register
user_router.post("/register", user_register)

// Verify
user_router.get("/verify/:token", user_verify)

// Login
user_router.get("/login", user_login)

// Profile
user_router.get("/profile", is_logged_in, user_profile)

// Logout
user_router.get("/logout", is_logged_in, user_logout)

// Reset Password
user_router.post("/forgot-password", user_forgot_password)

// Reset Password
user_router.post("/reset-password/:reset_token", user_reset_password)

export default user_router