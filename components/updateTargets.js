const pool = require("../services/postgre.js");

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
        FROM analyzed_foods,
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


        // Get current targets
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


        if(profile.rows.length === 0){
            throw new Error("Profile not found");
        }


        // Convert PostgreSQL numeric strings to numbers
        const targetCalories = Number(profile.rows[0].target_calories);
        const protein = Number(profile.rows[0].protein);
        const carbs = Number(profile.rows[0].carbs);
        const fat = Number(profile.rows[0].fat);


        const consumedCalories = Number(total_calories);
        const consumedProtein = Number(total_protein);
        const consumedCarbs = Number(total_carbs);
        const consumedFat = Number(total_fat);


        let newCalories = targetCalories;
        let newProtein = protein;
        let newCarbs = carbs;
        let newFat = fat;


        // Calories adjustment
        if(consumedCalories > targetCalories) {

            newCalories = targetCalories -
            Math.ceil((consumedCalories - targetCalories) / 6);

        } 
        else if(consumedCalories < targetCalories) {

            newCalories = targetCalories +
            Math.ceil((targetCalories - consumedCalories) / 6);

        }


        // Protein adjustment
        if(consumedProtein > protein) {

            newProtein = protein -
            Math.ceil((consumedProtein - protein) / 6);

        } 
        else if(consumedProtein < protein) {

            newProtein = protein +
            Math.ceil((protein - consumedProtein) / 6);

        }


        // Carbs adjustment
        if(consumedCarbs > carbs) {

            newCarbs = carbs -
            Math.ceil((consumedCarbs - carbs) / 6);

        } 
        else if(consumedCarbs < carbs) {

            newCarbs = carbs +
            Math.ceil((carbs - consumedCarbs) / 6);

        }


        // Fat adjustment
        if(consumedFat > fat) {

            newFat = fat -
            Math.ceil((consumedFat - fat) / 6);

        } 
        else if(consumedFat < fat) {

            newFat = fat +
            Math.ceil((fat - consumedFat) / 6);

        }



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
            Math.round(newCalories),
           Number(newProtein.toFixed(2)),
Number(newFat.toFixed(2)),
Number(newCarbs.toFixed(2)),
            userid
        ]);


        console.log("Targets updated:", {
            calories: Math.round(newCalories),
            protein: Math.round(newProtein),
            carbs: Math.round(newCarbs),
            fat: Math.round(newFat)
        });


    } catch(err){

        console.log("Target update error:",err);
        throw err;

    }
}


module.exports = {updateTargets};
