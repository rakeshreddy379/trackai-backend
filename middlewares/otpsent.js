const nodemailer = require("nodemailer");
const pool = require("../services/postgre");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

async function otpSent(req, res, next) {
    try {
        const { email } = req.body;

        console.log(email);

        const r = await pool.query(
            "SELECT * FROM login_details WHERE email = $1",
            [email]
        );

        if (r.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const userId = r.rows[0].userid;
        console.log(userId);

        const random = Math.floor(100000 + Math.random() * 900000);

        const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_SMTP_KEY
    }
});

        console.log("Verify  SMTP...");

        await transporter.verify();

        console.log("SMTP Verified");

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${random}. It is valid for 10 minutes.`
        };

        console.log("Before sendMail");

       

        const info = await transporter.sendMail(mailOptions);

        

        console.log("After sendMail");
        console.log(info.response);

        await pool.query(
            "DELETE FROM otpdetails WHERE email = $1",
            [email]
        );

        await pool.query(
            `INSERT INTO otpdetails
            (userid, email, otp, otp_expires_at)
            VALUES ($1, $2, $3, $4)`,
            [
                userId,
                email,
                random,
                new Date(Date.now() + 10 * 60 * 1000)
            ]
        );

        return res.status(200).json({
            success: true,
            userid: userId,
            message: "Verify your account. Please check your email for the OTP."
        });

    } catch (error) {
        console.error("OTP Error:", error);
        return next(error);
    }
}

module.exports = otpSent;
