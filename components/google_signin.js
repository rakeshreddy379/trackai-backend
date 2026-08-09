const { OAuth2Client } = require("google-auth-library");
const pool = require("../services/postgre.js");
const generateUserId = require("../components/generateUserId.js");

require("dotenv").config();

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

async function googleLogin(req, res) {

    const { idToken } = req.body;

    try {

        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        console.log("Google payload:", payload);

        const email = payload.email;
        const googleId = payload.sub;

        // Check if user already exists
        const result = await pool.query(
            `
            SELECT *
            FROM login_details
            WHERE email = $1
            `,
            [email]
        );

        let userid;

        // =========================
        // NEW USER
        // =========================
        if (result.rows.length === 0) {

            userid = await generateUserId();

            console.log("Generated userid:", userid);

            await pool.query(
                `
                INSERT INTO login_details
                (
                    email,
                    userid,
                    is_verified,
                    google_id
                )
                VALUES ($1, $2, $3, $4)
                `,
                [
                    email,
                    userid,
                    true,
                    googleId
                ]
            );

            console.log("New user inserted");

        }

        // =========================
        // EXISTING USER
        // =========================
        else {

            userid = result.rows[0].userid;

            console.log("Existing userid:", userid);
        }

        // =========================
        // RETURN RESPONSE
        // =========================

        console.log("Returning userid:", userid);

        return res.status(200).json({
            success: true,
            userid: userid,
            token: userid
        });

    } catch (err) {

        console.error("Google Login Error:", err);

        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

module.exports = googleLogin;
