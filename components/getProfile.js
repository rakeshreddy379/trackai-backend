const pool = require("../services/postgre");

async function getProfile(req, res) {

    try {

        const { userid } = req.query;
console.log("User ID from request:", userid);
        const result = await pool.query(
            `
            SELECT *
            FROM profile
            WHERE userid = $1
            `,
            [userid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = getProfile;