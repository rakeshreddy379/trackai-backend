const pool = require("../services/postgre.js");
async function calculateCalories(req, res,next) {

    try {

       const {
    userid,
    full_name,
    gender,
    age,
    weight,
    target_weight,
    height,
    activityLevel,
    goal,
    goalType,
    target_date,
    referral_source
} = req.body; 
      console.log('profile body:',req.body)
       console.log(
     userid,
    full_name,
    gender,
    age,
    weight,
    target_weight,
    height,
    activityLevel,
    goal,
    goalType,
    target_date,
    referral_source
);

console.log("goal:", goal);

        const genderValue = {
            male: 5,
            female: -161
        };
console.log("goal:", goal);

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

const minimum_steps=10000
const water = weight * 35;
        await pool.query(
            `INSERT INTO profile
            (
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
                target_calories,
                expected_weekly_change,
                protein,
                fat,
                carbs,
                water_ml,
                minimum_steps,
                target_date,
                referral_source
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
            )
            `,
           [
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
    Math.round(bmr),
    Math.round(maintenanceCalories),
    Math.round(targetCalories),
    weeklyChange[goal][goalType],
    Number(protein.toFixed(2)),
    Number(fat.toFixed(2)),
    Number(carbs.toFixed(2)),
    Math.round(water),
    minimum_steps,
    target_date,
    referral_source
]    );
        res.status(201).json({
            success: true,
          data: {
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round(maintenanceCalories),
    targetCalories: Math.round(targetCalories),
    expectedWeeklyChange: weeklyChange[goal][goalType],
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    water: Math.round(water),
    minimum_steps,
    target_date,
}
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = calculateCalories;
