const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "trackai",
    password: "4124",
    port: 5432,
});

module.exports = pool;