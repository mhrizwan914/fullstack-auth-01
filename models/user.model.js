// Mongoose
import mongoose from "mongoose"
// Bcryptjs
import bcrypt from "bcryptjs"

const user_schema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    is_verified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    email_verification_token: String,
    password_reset_token: String,
    password_reset_token_expiry: Date
}, {
    timestamps: true
})

// Hooks
user_schema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

const User = mongoose.model("user", user_schema)

export default User