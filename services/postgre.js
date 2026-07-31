const { Pool } = require("pg");

const pool = new Pool({
    user: "trackaiuser",
    host: "dpg-d9lklmp42hec739tvtjg-a.singapore-postgres.render.com",
    database: "trackai_3msz",
    password: "xReQd4pJiVzzBG5PNyT2TX0COkFCjMDL",
    port: 5432,
});

module.exports = pool;
