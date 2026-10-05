const ai = require("../services/gemini");
const sharp = require("sharp");
const fs = require("fs");
const XLSX = require("xlsx");
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
    let { foodName, userid, meal_type } =
        req.body || req.query || req.params;

    console.log("came in geminiscan");

    if (meal_type == null) {
        meal_type = "entire day";
    }

    try {
        const profileQuery = await pool.query(
            `SELECT * FROM profile WHERE userid=$1`,
            [userid]
        );

        if (profileQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

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

        const profile = profileQuery.rows[0];

        /*
         * ------------------------------------------------
         * 1. Get food names from normal request
         * ------------------------------------------------
         */

        let foodNames = [];

        if (foodName) {
            if (Array.isArray(foodName)) {
                foodNames.push(...foodName);
            } else {
                foodNames.push(foodName);
            }
        }

        /*
         * ------------------------------------------------
         * 2. If Excel file is uploaded, read food names
         * ------------------------------------------------
         */

        if (req.file) {
            const extension = req.file.originalname
                .split(".")
                .pop()
                .toLowerCase();

            if (extension === "xlsx" || extension === "xls") {

                const workbook = XLSX.readFile(req.file.path);

                const sheetName = workbook.SheetNames[0];

                const sheet = workbook.Sheets[sheetName];

                const rows = XLSX.utils.sheet_to_json(sheet, {
                    header: 1
                });

                for (const row of rows) {
                    for (const value of row) {
                        if (
                            typeof value === "string" &&
                            value.trim().length > 0
                        ) {
                            foodNames.push(value.trim());
                        }
                    }
                }
            }
        }

        /*
         * Remove duplicates
         */

        foodNames = [...new Set(foodNames)];

        /*
         * ------------------------------------------------
         * 3. Create Gemini prompt
         * ------------------------------------------------
         */

        const prompt = `
Profile:
W:${profile.current_weight_kg}, TW:${profile.target_weight_kg},
G:${profile.goal}, GT:${profile.goal_type}, A:${profile.activity_level},
C:${profile.calories}, P:${profile.protein}, CB:${profile.carbs}, F:${profile.fat}

Today completed nutrients:
TC:${total_calories},
TP:${total_protein},
TCA:${total_carbs},
TF:${total_fat},
TFI:${total_fiber},
TS:${total_sugar}

Available food names:
${foodNames.join(", ")}

Create a healthy ${meal_type} meal for ${profile.goal}.

Use the provided food names when available.
If an image is provided, identify the foods in the image and use them.

Target:
${profile.calories} kcal,
${profile.protein}g protein,
${profile.carbs}g carbs,
${profile.fat}g fat.

Return ONLY JSON:

{
  "meals": [
    {
      "meal_type": "name",
      "foods": [
        {
          "name": "food",
          "quantity": "serving either as count or grams",
          "kcal": 0,
          "protein": 0,
          "carbs": 0,
          "fat": 0,
          "fiber": 0,
          "sugar": 0
        }
      ]
    }
  ],
  "totals": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "sugar": 0,
    "fiber": 0
  }
}
`;

        /*
         * ------------------------------------------------
         * 4. Build Gemini contents
         * ------------------------------------------------
         */

        const contents = [
            {
                text: prompt
            }
        ];

        /*
         * ------------------------------------------------
         * 5. If image is uploaded, add image to Gemini
         * ------------------------------------------------
         */

        if (req.file) {

            const extension = req.file.originalname
                .split(".")
                .pop()
                .toLowerCase();

            const imageExtensions = [
                "jpg",
                "jpeg",
                "png",
                "webp"
            ];

            if (imageExtensions.includes(extension)) {

                const imageBuffer = fs.readFileSync(req.file.path);

                contents.push({
                    inlineData: {
                        mimeType: req.file.mimetype,
                        data: imageBuffer.toString("base64")
                    }
                });
            }
        }

        /*
         * ------------------------------------------------
         * 6. Require at least food name, Excel or image
         * ------------------------------------------------
         */

        const hasImage =
            req.file &&
            ["jpg", "jpeg", "png", "webp"].includes(
                req.file.originalname.split(".").pop().toLowerCase()
            );

        const hasExcel =
            req.file &&
            ["xlsx", "xls"].includes(
                req.file.originalname.split(".").pop().toLowerCase()
            );

        if (!foodNames.length && !hasImage && !hasExcel) {
            return res.status(400).json({
                success: false,
                message: "Provide food names, an image, or an Excel file"
            });
        }

        /*
         * ------------------------------------------------
         * 7. Send to Gemini
         * ------------------------------------------------
         */

        const response = await generateWithRetry({
            model: "gemini-3.1-flash-lite",
            contents,
            config: {
                responseMimeType: "application/json"
            }
        });

        const result =
            response.candidates[0].content.parts[0].text;

        const foodData = JSON.parse(result);

        console.log("Parsed food data:", foodData);

        /*
         * ------------------------------------------------
         * 8. Delete uploaded file
         * ------------------------------------------------
         */

        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }

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
            message: "internal server message"
        });
    }
}
module.exports = {
    planMymeal
};
