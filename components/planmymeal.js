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
 
    try {
        const profileQuery=await pool.query(`select * from profile where userid=$1`,[userid])
        const profile=profileQuery.rows[0]
       const prompt = `
Profile:
W:${profile.current_weight_kg}, TW:${profile.target_weight_kg},
G:${profile.goal}, GT:${profile.goal_type}, A:${profile.activity_level},
C:${profile.calories}, P:${profile.protein}, CB:${profile.carbs}, F:${profile.fat}

Foods:
${foodName.join(",")}

Create a healthy ${profile.goal} meal plan using these foods.
Target: ${profile.calories} kcal, ${profile.protein}g protein, ${profile.carbs}g carbs, ${profile.fat}g fat.

Return ONLY JSON:
{
  "meals":[
    {
      "name":${meal_type},
      "foods":[
        {"name":"food","quantity":"serving either as count or grams"}
      ]
    }
  ],
  "totals":{
    "calories":0,
    "protein":0,
    "carbs":0,
    "fat":0
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
