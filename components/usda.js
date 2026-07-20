const axios = require("axios");

const API_KEY = "YOUR_USDA_API_KEY";

async function getUSDAFoodNutrients(req, res) {
    try {
        const { foodname, grams = 100 } = req.query;

        // Search food
        const response = await axios.post(
            `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=KKunxdFqgygpEeqfhLSvVQxvnbekCcGL5uu8yA7X`,
            {
                query: `${foodname} raw`,
                dataType: ["Foundation", "SR Legacy"],
                pageSize: 10
            }
        );

        if (!response.data.foods.length) {
            return res.status(404).json({
                success: false,
                message: "Food not found"
            });
        }

        // Select best matching food
        let selectedFood = response.data.foods.find(food =>
            food.description
                .toLowerCase()
                .includes(foodname.toLowerCase())
        );

        // Special handling for egg
        if (foodname.toLowerCase().includes("egg")) {
            selectedFood = response.data.foods.find(food =>
                food.description.toLowerCase()
                    .includes("egg, whole")
            );
        }

        if (!selectedFood) {
            selectedFood = response.data.foods[0];
        }


        console.log("Selected:", selectedFood.description);
        console.log("FDC ID:", selectedFood.fdcId);


        // Get complete food details
        const details = await axios.get(
            `https://api.nal.usda.gov/fdc/v1/food/${selectedFood.fdcId}?api_key=KKunxdFqgygpEeqfhLSvVQxvnbekCcGL5uu8yA7X`
        );


        const food = details.data;


        console.log("Portions:");
        console.log(food.foodPortions);


        // USDA nutrients are usually per 100g
      const nutrients = {};

food.foodNutrients.forEach(n => {

    const name = n.nutrient?.name || n.nutrientName;
    const unit = n.nutrient?.unitName || n.unitName;

    if (name === "Energy" && unit === "KCAL") {
        nutrients["Calories"] = n.amount ?? n.value;
    }

    if (name && name !== "Energy") {
        nutrients[name] = n.amount ?? n.value;
    }

});

console.log(nutrients);


        const factor = Number(grams) / 100;


        return res.status(200).json({

            success: true,

            food: food.description,

            serving: `${grams} grams`,

            data: {

                calories:
                    ((nutrients["Calories"] || 0) * factor)
                    .toFixed(2),

                protein:
                    ((nutrients["Protein"] || 0) * factor)
                    .toFixed(2),

                carbs:
                    ((nutrients["Carbohydrate, by difference"] || 0) * factor)
                    .toFixed(2),

                fat:
                    ((nutrients["Total lipid (fat)"] || 0) * factor)
                    .toFixed(2),

                fiber:
                    ((nutrients["Fiber, total dietary"] || 0) * factor)
                    .toFixed(2),

                sugar:
                    ((nutrients["Sugars, Total"] || 0) * factor)
                    .toFixed(2)

            }

        });


    } catch (err) {

        console.log(err.response?.data || err.message);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


module.exports = { getUSDAFoodNutrients };