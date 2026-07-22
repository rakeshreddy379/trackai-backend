const { pool } = require("./postgre.js");

async function updateTargets(userid) {
    try {

        // Get today's consumed nutrients
        const result = await pool.query(
        `
        SELECT 
            COALESCE(SUM((food->>'kcal')::numeric),0) AS total_calories,
            COALESCE(SUM((food->>'protein')::numeric),0) AS total_protein,
            COALESCE(SUM((food->>'carbs')::numeric),0) AS total_carbs,
            COALESCE(SUM((food->>'fat')::numeric),0) AS total_fat
        FROM food_logs,
        jsonb_array_elements(detected_foods::jsonb) AS food
        WHERE userid=$1
        AND analyzed_at::date=CURRENT_DATE;
        `,
        [userid]
        );


        const {
            total_calories,
            total_protein,
            total_carbs,
            total_fat
        } = result.rows[0];


        // Get user target
        const profile = await pool.query(
        `
        SELECT 
            target_calories,
            protein,
            carbs,
            fat
        FROM profile
        WHERE userid=$1
        `,
        [userid]
        );


        const {
            target_calories,
            protein,
            carbs,
            fat
        } = profile.rows[0];


        let newCalories = target_calories;
        let newProtein = protein;
        let newCarbs = carbs;
        let newFat = fat;


        // Calories
        if(total_calories > target_calories)
            newCalories = target_calories - Math.ceil((total_calories-target_calories)/6);

        else if(total_calories < target_calories)
            newCalories = target_calories + Math.ceil((target_calories-total_calories)/6);


        // Protein
        if(total_protein > protein)
            newProtein = protein - Math.ceil((total_protein-protein)/6);

        else if(total_protein < protein)
            newProtein = protein + Math.ceil((protein-total_protein)/6);


        // Carbs
        if(total_carbs > carbs)
            newCarbs = carbs - Math.ceil((total_carbs-carbs)/6);

        else if(total_carbs < carbs)
            newCarbs = carbs + Math.ceil((carbs-total_carbs)/6);


        // Fat
        if(total_fat > fat)
            newFat = fat - Math.ceil((total_fat-fat)/6);

        else if(total_fat < fat)
            newFat = fat + Math.ceil((fat-total_fat)/6);



        await pool.query(
        `
        UPDATE profile
        SET
            new_target_calories=$1,
            new_target_calories_date=CURRENT_DATE + INTERVAL '6 days',

            new_target_protein=$2,
            new_target_protein_date=CURRENT_DATE + INTERVAL '6 days',

            new_target_carbs=$3,
            new_target_carbs_date=CURRENT_DATE + INTERVAL '6 days',

            new_target_fat=$4,
            new_target_fat_date=CURRENT_DATE + INTERVAL '6 days'

        WHERE userid=$5
        `,
        [
            newCalories,
            newProtein,
            newCarbs,
            newFat,
            userid
        ]);

    } catch(err){
        console.log("Target update error:",err);
        throw err;
    }
}


module.exports = updateTargets;