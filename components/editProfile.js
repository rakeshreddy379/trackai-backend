const pool = require("../services/postgre");

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
            activityLevel,
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
            lose: {
                slow: -250,
                moderate: -500
            },
            maintain: {
                maintenance: 0
            },
            gain: {
                slow: 250,
                moderate: 500
            }
        };

        const weeklyChange = {
            lose: {
                slow: "-0.25 kg/week",
                moderate: "-0.5 kg/week"
            },
            maintain: {
                maintenance: "0 kg/week"
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
            lose: 1.8,
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

        const water = weight * 35;

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
                Math.round(protein),
                Math.round(fat),
                Math.round(carbs),
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

module.exports = updateProfile;