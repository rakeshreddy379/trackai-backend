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
async function planMymeal(req, res) {
    // console.log(req.body)
    const { foodName, userid,meal_type} = req.body||req.query||req.params;
    console.log('came in geminiscan')
    if(meal_type==null){
        meal_type='entire day'
    }
    try {
        const profileQuery=await pool.query(`select * from profile where userid=$1`,[userid])
        const todaynutrients = await pool.query(
        `
        SELECT 
            COALESCE(SUM((food->>'kcal')::numeric),0) AS total_calories,
            COALESCE(SUM((food->>'protein')::numeric),0) AS total_protein,
            COALESCE(SUM((food->>'carbs')::numeric),0) AS total_carbs,
            COALESCE(SUM((food->>'fat')::numeric),0) AS total_fat,
            COALESCE(SUM((food->>'sugar')::numeric),0) AS total_sugar,
            COALESCE(SUM((food->>'fiber')::numeric),0) AS total_fiber
        FROM analyzed_foods,
        json_array_elements(detected_foods::json) AS food
        WHERE userid=$1
        AND analyzed_at::date=CURRENT_DATE;
        `,
        [userid]
        );


        const {
            total_calories,
            total_protein,
            total_carbs,
            total_fat,
            total_sugar,
            total_fiber
        } = todaynutrients.rows[0];
        const profile=profileQuery.rows[0]
       const prompt = `
Profile:
W:${profile.current_weight_kg}, TW:${profile.target_weight_kg},
G:${profile.goal}, GT:${profile.goal_type}, A:${profile.activity_level},
C:${profile.calories}, P:${profile.protein}, CB:${profile.carbs}, F:${profile.fat}
Today completed nurients:
TC:${total_calories}, TP:${total_protein},
TCA:${total_carbs},  A:${total_fat},
TFI:${total_fiber},TS:${total_sugar}
Foods:
${foodName.join(",")}

Create a healthy ${meal_type} meal for ${profile.goal}  using these foods by con.
Target: ${profile.calories} kcal, ${profile.protein}g protein, ${profile.carbs}g carbs, ${profile.fat}g fat.

Return ONLY JSON:
{
  "meals":[
    {
      "meal_type":name,
      "foods":[
        {"name":"food","quantity":"serving either as count or grams,"kcal":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0"}
      ]
    }
  ],
  "totals":{
    "calories":0,
    "protein":0,
    "carbs":0,
    "fat":0,
    "sugar":0,
    "fiber":0
  }
}
`;
        
            if (foodName) {
            contents = [
                { text: `${prompt}` }
            ];
        } else {
            return res.status(400).json({
                success: false,
                message: "Provide either an image or a food name"
            });
        }

     const response = await generateWithRetry({
    model: "gemini-3.1-flash-lite",
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
        return res.status(200).json({
            success: true,
            result: foodData,
            userid: userid
        });

    } catch (err) {
        console.error(err);

        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }

        return res.status(500).json({
            success: false,
            message: 'internal server message'
        });
    }
}
module.exports = {
    planMymeal
};
