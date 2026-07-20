const axios = require("axios");

const getFoodNutrients = async (req, res) => {
    try {
        const { food } = req.query;
        console.log("Food query:", food); 
          
        // Get Token
        const tokenResponse = await axios.post(
            "https://oauth.fatsecret.com/connect/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                scope: "basic"
            }),
            {
                auth: {
                    username: process.env.FATSECRET_CLIENT_ID,
                    password: process.env.FATSECRET_CLIENT_SECRET
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        const token = tokenResponse.data.access_token;

        // Search Food
        const searchResponse = await axios.get(
            "https://platform.fatsecret.com/rest/server.api",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    method: "foods.search",
                    search_expression: food,
                    format: "json"
                }
            }
        );
console.log(searchResponse.data);
        const foods = searchResponse.data.foods.food;

        if (!foods) {
            return res.status(404).json({ message: "Food not found" });
        }

        const foodId = Array.isArray(foods)
            ? foods[0].food_id
            : foods.food_id;

        // Get Nutrients
        const detailsResponse = await axios.get(
            "https://platform.fatsecret.com/rest/server.api",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    method: "food.get",
                    food_id: foodId,
                    format: "json"
                }
            }
        );

        res.json(detailsResponse.data);

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getFoodNutrients };