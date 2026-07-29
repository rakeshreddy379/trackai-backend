const pool = require("../services/postgre");

async function getProfile(req, res) {

    try {
        const { userid } = req.query;
console.log("User ID from request 1:", userid);
        const result = await pool.query(
            `
            SELECT

    userid,
    full_name,
    gender,
    age,
    height_cm,
    current_weight_kg,
    target_weight_kg,
    activity_level,
    goal,
    goal_type,

    bmr,
    maintenance_calories,

    -- Calories priority
    CASE
        WHEN calories_custom_until >= CURRENT_DATE
        THEN calories_custom

        WHEN new_target_calories_date >= CURRENT_DATE
        THEN new_target_calories

        ELSE target_calories
    END AS calories,


    -- Protein priority
    CASE
        WHEN protein_custom_until >= CURRENT_DATE
        THEN protein_custom

        WHEN new_target_protein_date >= CURRENT_DATE
        THEN new_target_protein

        ELSE protein
    END AS protein,


    -- Carbs priority
    CASE
        WHEN carbs_custom_until >= CURRENT_DATE
        THEN carbs_custom

        WHEN new_target_carbs_date >= CURRENT_DATE
        THEN new_target_carbs

        ELSE carbs
    END AS carbs,


    -- Fat priority
    CASE
        WHEN fat_custom_until >= CURRENT_DATE
        THEN fat_custom

        WHEN new_target_fat_date >= CURRENT_DATE
        THEN new_target_fat

        ELSE fat
    END AS fat,


    -- Water priority
    CASE
        WHEN water_custom_until >= CURRENT_DATE
        THEN water_custom

        ELSE water_ml
    END AS water,


    minimum_steps,

    target_date,
    referral_source


FROM profile
WHERE userid = $1;
            `,
            [userid]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({
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