// Nodemailer
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
    },
})

async function send_mail(
    subject = "",
    text = ""
) {
    try {
        const info = await transporter.sendMail({
            from: "dev.mr@inhousedept.com",
            to: "dev.mr@inhousedept.com",
            subject: `${subject} - Fullstack Auth`,
            text,
        })
        return info?.messageId
    } catch (error) {
        throw error?.message
    }
}

export default send_mail