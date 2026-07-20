const pool = require("../services/postgre");

async function userExists(req, res, next) {

    try {

        const { userid } = req.body || req.query || req.params;
console.log("User ID from request:", userid);
        const result = await pool.query(
            "SELECT * FROM login_details WHERE userid = $1",
            [userid]
        );

        if (result.rows.length > 0) {

           next()

        }

        else {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

}

module.exports = userExists;