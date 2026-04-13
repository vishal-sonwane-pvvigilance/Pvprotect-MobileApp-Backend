import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();



const sendotpMail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        console.log('EMAIL_USER',process.env.EMAIL_USER,)
        console.log('EMAIL_PASS',process.env.EMAIL_PASS,)

        // ✅ ADD THIS — reveals exact error on Render
        await transporter.verify();
        console.log("✅ SMTP connection verified");

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Verification Code",
            html: `
                <div style="font-family: Arial; padding:20px">
                    <h2>OTP Verification</h2>
                    <p>Your OTP is:</p>
                    <h1 style="color:#2e7d32">${otp}</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                </div>
            `
        };

        console.log("Sending OTP to:", email);
        await transporter.sendMail(mailOptions);
        console.log("✅ OTP email sent successfully");
        return true;

    } catch (error) {
        // ✅ Log the full error, not just message
        console.error("❌ Email error code:", error.code);
        console.error("❌ Email error message:", error.message);
        console.error("❌ Full error:", JSON.stringify(error, null, 2));
        throw new Error("Failed to send OTP email");
    }
}


console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");


export default sendotpMail;