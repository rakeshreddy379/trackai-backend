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
        await pool.query(
            `INSERT INTO analyzed_foods (userid, meal_type, detected_foods)
             VALUES ($1, $2, $3)`,
            [userid, meal_type, JSON.stringify(foodData.foods)]
        );

        // Delete uploaded file only if it exists
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }

        return res.status(200).json({
            success: true,
            result: foodData
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