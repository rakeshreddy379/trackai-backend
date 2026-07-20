const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

let accessToken = null;

// ===============================
// Get FatSecret Access Token
// ===============================
async function getAccessToken() {
    try {

        const response = await axios.post(
            "https://oauth.fatsecret.com/connect/token",
            "grant_type=client_credentials&scope=basic",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                auth: {
                    username: process.env.FATSECRET_CLIENT_ID,
                    password: process.env.FATSECRET_CLIENT_SECRET
                }
            }
        );

        accessToken = response.data.access_token;

        console.log("FatSecret Token Generated");

    } catch (err) {

        console.log(err.response?.data || err.message);

    }
}

// ===============================
// Search Food
// ===============================
app.get("/search/:food", async (req, res) => {

    try {

        if (!accessToken) {
            await getAccessToken();
        }

        const response = await axios.post(
            "https://platform.fatsecret.com/rest/server.api",
            null,
            {
                params: {
                    method: "foods.search",
                    search_expression: req.params.food,
                    format: "json"
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        res.json(response.data);

    } catch (err) {

        console.log(err.response?.data || err.message);

        res.status(500).json(err.response?.data || err.message);

    }

});

// ===============================
// Food Details
// ===============================
app.get("/food/:id", async (req, res) => {

    try {

        if (!accessToken) {
            await getAccessToken();
        }

        const response = await axios.post(
            "https://platform.fatsecret.com/rest/server.api",
            null,
            {
                params: {
                    method: "food.get",
                    food_id: req.params.id,
                    format: "json"
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        res.json(response.data);

    } catch (err) {

        console.log(err.response?.data || err.message);

        res.status(500).json(err.response?.data || err.message);

    }

});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {

    await getAccessToken();

    console.log(`Server running on http://localhost:${PORT}`);

});