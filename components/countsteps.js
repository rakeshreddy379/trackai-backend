const pool = require("../services/postgre");

async function saveSteps(req, res) {
    try {

        const { userid, steps } = req.body;

        // Average step length = 0.762 meters
        const distanceKm = (steps * 0.762) / 1000;

        // Approximate calories burned = 0.04 kcal per step
        const caloriesBurned = steps * 0.04;

        await pool.query(
            `
            INSERT INTO daily_steps
            (
                userid,
                step_date,
                steps,
                distance_km,
                calories_burned
            )
            VALUES
            (
                $1,
                CURRENT_DATE,
                $2,
                $3,
                $4
            )
            ON CONFLICT (userid, step_date)
            DO UPDATE SET
                steps = EXCLUDED.steps,
                distance_km = EXCLUDED.distance_km,
                calories_burned = EXCLUDED.calories_burned,
                updated_at = CURRENT_TIMESTAMP
            `,
            [
                userid,
                steps,
                Number(distanceKm.toFixed(2)),
                Number(caloriesBurned.toFixed(2))
            ]
        );

        return res.status(200).json({
            success: true,
            data: {
                steps,
                distance_km: Number(distanceKm.toFixed(2)),
                calories_burned: Number(caloriesBurned.toFixed(2))
            }
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}

module.exports = {saveSteps};