const cron = require("node-cron");
const pool = require("../services/postgre.js"); // your PostgreSQL connection

cron.schedule("*/5 * * * *", async () => {
    try {
        await pool.query(`
            DELETE FROM otpdetails
            WHERE  otp_expires_at < NOW()
        `);

        console.log("Expired OTPs deleted");
    } catch (err) {
        console.error(err);
    }
});