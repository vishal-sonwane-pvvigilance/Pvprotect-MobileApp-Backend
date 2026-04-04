import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();



 const sendotpMail = async (email,otp)=>{
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
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
console.log("otp", otp);
        await transporter.sendMail(mailOptions);
        return true;
        

    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error("Failed to send OTP email");
    }
}

console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");


export default sendotpMail;