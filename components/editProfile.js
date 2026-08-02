const pool = require("../services/postgre");

async function updateNutrients(req, res, next) {

    try {

        const { userid } = req.body;

        const {
            calories_custom,
            protein_custom,
            carbs_custom,
            fat_custom,
            water_custom,
            calories_custom_until,
            protein_custom_until,
            carbs_custom_until,
            fat_custom_until,
water_custom_until
        } = req.body || {};
        const fields = [];
        const values = [];

        let index = 1;


        const data = {
            calories_custom,
            protein_custom,
            carbs_custom,
            fat_custom,
 water_custom,
            calories_custom_until,
            protein_custom_until,
            carbs_custom_until,
            fat_custom_until,
            water_custom_until
        };
        for (const key in data) {

            if (data[key] !== undefined) {

                fields.push(`${key} = $${index}`);
                values.push(data[key]);
                index++;

            }

        }


        if (fields.length === 0) {

            return res.status(200).json({
                success: false,
                message: "No nutrients provided for update"
            });

        }


        values.push(userid);


        const query = `
            UPDATE profile
            SET ${fields.join(", ")}
            WHERE userid = $${index}
            RETURNING *
        `;


        const result = await pool.query(query, values);


        if (result.rows.length === 0) {

            return res.status(404).json({
                success:false,
                message:"Profile not found"
            });

        }


        res.status(200).json({
            success:true,
            message:"Custom nutrients updated successfully",
            data:result.rows[0]
        });


    } catch(err) {

        console.log(err);

        res.status(500).json({
            success:false,
            message:err.message
        });

    }
}




async function updateProfile(req, res) {
    try {

        const {
            userid,
            full_name,
            gender,
            age,
            height,
            weight,
            target_weight,
            activityLevel,water,
            goal,
            goalType,
            target_date,
            referral_source
        } = req.body;

        const genderValue = {
            male: 5,
            female: -161
        };

        const activity = {
            sedentary: 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            very_active: 1.725,
            athlete: 1.9
        };

       const goalCalories = {
    loss: {
        mild: -250,
        moderate: -500
    },
    maintain: {
        moderate: 0
    },
    gain: {
        slow: 250,
        moderate: 500
    }
};

const weeklyChange = {
    loss: {
        mild: "-0.25 kg/week",
        moderate: "-0.5 kg/week"
    },
    maintain: {
        moderate: "0 kg/week"
    },
    gain: {
        slow: "+0.25 kg/week",
        moderate: "+0.5 kg/week"
    }
};
        const bmr =
            (10 * weight) +
            (6.25 * height) -
            (5 * age) +
            genderValue[gender];

        const maintenanceCalories =
            bmr * activity[activityLevel];

        const targetCalories =
            maintenanceCalories +
            goalCalories[goal][goalType];
        const proteinMultiplier = {
    loss: 1.8,
    maintain: 1.2,
    gain: 1.6
};

const protein = weight * proteinMultiplier[goal];

const fat = (targetCalories * 0.25) / 9;

const carbs =
    (
        targetCalories -
        (protein * 4) -
        (fat * 9)
    ) / 4;
console.log(weeklyChange[goal][goalType])
 water = weight * 35;

        await pool.query(
            `
            UPDATE profile
            SET
                full_name = $1,
                gender = $2,
                age = $3,
                height_cm = $4,
                current_weight_kg = $5,
                target_weight_kg = $6,
                activity_level = $7,
                goal = $8,
                goal_type = $9,
                bmr = $10,
                maintenance_calories = $11,
                target_calories = $12,
                expected_weekly_change = $13,
                protein = $14,
                fat = $15,
                carbs = $16,
                water_ml = $17,
                target_date = $18,
                referral_source = $19,
                updated_at = CURRENT_TIMESTAMP
            WHERE userid = $20
            `,
            [
                full_name,
                gender,
                age,
                height,
                weight,
                target_weight,
                activityLevel,
                goal,
                goalType,
                Math.round(bmr),
                Math.round(maintenanceCalories),
                Math.round(targetCalories),
                weeklyChange[goal][goalType],
                Number(protein.toFixed(2)),
Number(fat.toFixed(2)),
Number(carbs.toFixed(2)),
                Math.round(water),
                target_date,
                referral_source,
                userid
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully."
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}

module.exports = {updateProfile,updateNutrients};
