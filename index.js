// App
import app from "./app.js"
// Database handler
import db_handler from "./config/db_connection.js"
// User routes
import user_router from "./routes/user.route.js"

// Port
const port = process.env.PORT || 4000

// All routes
app.use("/api/v1/user", user_router)

// Call database
db_handler().then(() => {
    // Server listening
    app.listen(port, () => {
        console.log(`😉 Server is running at port ${port}`)
    })
}).catch((error) => {
    console.log(`Databse connection is failed`, error?.message)
    process.exit(1)
})