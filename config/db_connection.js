// Mongoose
import mongoose from "mongoose"
// Constants
import { DB_NAME } from "./constants.js"

async function db_handler() {
    try {
        const db_instance = await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`)
        console.log("Database is connected DB_NAME:", db_instance.connection.name)
    } catch (error) {
        console.log("Error in during database conection", error?.message)
        throw error
    }
}

export default db_handler