// Express
import express from "express"
// Controllers
import {
    user_register,
    user_verify
} from "../controllers/user.controller.js"

// Create express router
const user_router = express.Router({ caseSensitive: true, strict: true })

// Register
user_router.post("/register", user_register)

// Verify
user_router.get("/verify/:token", user_verify)

export default user_router