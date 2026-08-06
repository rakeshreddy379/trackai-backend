const express = require("express");
const cors = require("cors");
const pool = require("./services/postgre");

const app = express();
// ---------------- Middleware ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- Database ----------------


app.use(cors({
    origin: "*",
    methods: "*"
}));
pool.connect()
    .then(() => {
        console.log(" PostgreSQL Connected");
    })
    .catch((err) => {
        console.log("Database Error:", err.message);
    });
pool.query("SELECT current_database(), current_schema()")
.then(result => {
    console.log("Connected DB:", result.rows);
})
.catch(err => console.log(err));
// ---------------- Routes ----------------

const authRoutes = require("./routes/route");

app.use("/", authRoutes);




app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

// ---------------- Start Server ----------------

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
