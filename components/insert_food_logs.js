const {pool} = require('../services/postgre.js');
async function insertFoodLog(req, res, next) {
    try {
        const { userId } = req.userId;
        const { food_name, serving_size, quantity, calories, protein, carbs, fats, meal_type } = req.food_log;

        await pool.query(
            "INSERT INTO food_logs (userid, food_name, serving_size, quantity, calories, protein, carbs, fats, meal_type,consumed_at,created_at,meal_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
            [userId, food_name, serving_size, quantity, calories, protein, carbs, fats, meal_type, new Date(), new Date(), new Date().toISOString().split("T")[0]]
        );
        
        res.status(201).json({ message: "Food log inserted successfully" });
    } catch (err) {
        console.error("Error inserting food log:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
