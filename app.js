// Express
import express from "express"
// Dotenv
import dotenv from "dotenv"
// Cookie Parser
import cookieParser from "cookie-parser"

// Dotenv Config
dotenv.config({ path: "./.env" })

// Create express app
const app = express()

// Middlewares
app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(cookieParser())

export default app