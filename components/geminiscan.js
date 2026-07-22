const ai = require("../services/gemini");
const sharp = require("sharp");
const fs = require("fs");
const pool = require("../services/postgre");
async function generateWithRetry(request, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(request);
        } catch (err) {
            console.log("Attempt:", i + 1);

            if (
                (err.status === 503 ||
                    err.message?.includes("503") ||
                    err.message?.includes("UNAVAILABLE")) &&
                i < retries - 1
            ) {
                console.log("Gemini busy. Retrying...");
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }

            throw err;
        }
    }
}
async function analyzeFood(req, res) {
    const { foodName, meal_type, userid } = req.body||req.query||req.params;

    try {
        const prompt =
            'Return JSON only: {"foods":[{"name":"","serving":"","kcal":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0}]}. If image, identify foods and use a standard serving. If foodName is given, return nutrients for that food.';

        let contents = [];

        if (req.file) {
            const imageBuffer = fs.readFileSync(req.file.path);

            const compressedImage = await sharp(imageBuffer)
                .resize({ width: 1024, withoutEnlargement: true })
                .jpeg({ quality: 70 })
                .toBuffer();

            contents = [
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: compressedImage.toString("base64")
                    }
                },
                { text: prompt }
            ];
        } else if (foodName) {
            contents = [
                { text: `${prompt} Food: ${foodName}` }
            ];
        } else {
            return res.status(400).json({
                success: false,
                message: "Provide either an image or a food name"
            });
        }

     const response = await generateWithRetry({
    model: "gemini-2.5-flash-lite",
    contents,
    config: {
        responseMimeType: "application/json"
    }
});

//console.log("Gemini response:", response);

let result = response.candidates[0].content.parts[0].text;

const foodData = JSON.parse(result);
console.log("Parsed food data:", foodData)
;
        // Save only the analysis result (no image stored)
//         await pool.query(
//             `INSERT INTO analyzed_foods (userid, meal_type, detected_foods)
//              VALUES ($1, $2, $3)`,
//             [userid, meal_type, JSON.stringify(foodData.foods)]
//         );

//         // Delete uploaded file only if it exists
//         if (req.file?.path) {
//             fs.unlink(req.file.path, () => {});
//         }
//          result = await pool.query(
// `
// SELECT 
//     COALESCE(SUM((food->>'kcal')::numeric),0) AS total_calories,
//     COALESCE(SUM((food->>'protein')::numeric),0) AS total_protein,
//     COALESCE(SUM((food->>'carbs')::numeric),0) AS total_carbs,
//     COALESCE(SUM((food->>'fat')::numeric),0) AS total_fat
// FROM analyzed_foods,
// jsonb_array_elements(detect_foods::jsonb) AS food
// WHERE userid = $1
// AND analyzed_at::date = CURRENT_DATE - INTERVAL '1 day';
// `,
// [userid]
// );

// const {
//     total_calories,
//     total_protein,
//     total_carbs,
//     total_fat
// } = result.rows[0];
//           //getting target calories
//         const profile = await pool.query(
// `
// SELECT 
//     target_calories,
// protein,
//     carbs,
//     fat
// FROM profile
// WHERE userid=$1
// `,
// [userid]
// );

// const {
//     target_calories,
//    protein,
//     carbs,
//     fat
// } = profile.rows[0];let newCalories = target_calories;
// let newProtein = protein;
// let newCarbs = carbs;
// let newFat = fat;


// // Calories
// if(total_calories > target_calories){
//     newCalories = target_calories - Math.ceil((total_calories - target_calories) / 6);
// }
// else if(total_calories < target_calories){
//     newCalories = target_calories + Math.ceil((target_calories - total_calories) / 6);
// }


// // Protein
// if(total_protein > protein){
//     newProtein = protein - Math.ceil((total_protein - protein) / 6);
// }
// else if(total_protein < protein){
//     newProtein = protein + Math.ceil((protein - total_protein) / 6);
// }


// // Carbs
// if(total_carbs > carbs){
//     newCarbs = carbs - Math.ceil((total_carbs - carbs) / 6);
// }
// else if(total_carbs < carbs){
//     newCarbs = carbs + Math.ceil((carbs - total_carbs) / 6);
// }


// // Fat
// if(total_fat > fat){
//     newFat = fat - Math.ceil((total_fat - fat) / 6);
// }
// else if(total_fat < fat){
//     newFat = fat + Math.ceil((fat - total_fat) / 6);
// }


// // Update all new targets
// await pool.query(
// `
// UPDATE profile
// SET
//     new_target_calories=$1,
//     new_target_calories_date=CURRENT_DATE + INTERVAL '6 days',

//     new_target_protein=$2,
//     new_target_protein_date=CURRENT_DATE + INTERVAL '6 days',

//     new_target_carbs=$3,
//     new_target_carbs_date=CURRENT_DATE + INTERVAL '6 days',

//     new_target_fat=$4,
//     new_target_fat_date=CURRENT_DATE + INTERVAL '6 days'

// WHERE userid=$5
// `,
// [
//     newCalories,
//     newProtein,
//     newCarbs,
//     newFat,
//     userid
// ]);
        return res.status(200).json({
            success: true,
            result: foodData,
            
        });

    } catch (err) {
        console.error(err);

        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
module.exports = {
    analyzeFood
};