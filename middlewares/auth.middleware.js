// JWT
import jwt from "jsonwebtoken"

async function is_logged_in(req, res, next) {
    const access_token = req?.cookies?.access_token
    if (!access_token) {
        return res.status(400).json({
            success: false,
            message: "Access token is required",
            status_code: 400,
        })
    }
    try {
        const decoded = jwt.verify(access_token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(400).json({
                success: false,
                message: "Token must be valid",
                status_code: 400,
            })
        }
        req.user = decoded
    } catch (error) {
        return res.status(error.code || 500).json({
            success: false,
            error: error?.message,
            message: "Internal server error",
            status_code: error.code || 500,
        })
    }
    next()
}

export default is_logged_in