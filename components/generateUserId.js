const pool = require("../services/postgre");

async function generateUserId() {

    while (true) {

        const userId = Math.floor(100000 + Math.random() * 900000);

        const result = await pool.query(
            `SELECT 1
             FROM login_details
             WHERE userid = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return userId;
        }

    }

}

module.exports = generateUserId;