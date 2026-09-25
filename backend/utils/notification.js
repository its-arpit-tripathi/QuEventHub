import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendEmailOTP = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"QuEventHub Team" <${process.env.EMAIL_USER}>`, 
            to: email,
            subject: 'Your Verification Code - QuEventHub',
            text: `Your verification code is ${otp}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow:auto; line-height: 2">
                  <div style="margin:50px auto; width:70%; padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em; color: #00466a; text-decoration:none; font-weight:600">QuEventHub</a>
                    </div>
                    <p style="font-size:1.1em">Hi,</p>
                    <p>Thank you for registering with QuEventHub. Use the following OTP to complete your Sign Up procedures. OTP is valid for 10 minutes</p>
                    <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
                    <p style="font-size:0.9em;">Regards,<br />QuEventHub Team</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                  </div>
                </div>
            ` 
        });
        console.log(`[Email] OTP sent to ${email}`);
        return true;

    } catch (error) {
        console.error("Email Error:", error);
        return false;
    }
};