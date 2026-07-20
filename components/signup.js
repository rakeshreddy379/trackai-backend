const bcrypt = require("bcrypt");
const pool = require("../services/postgre.js");
const userExists = require("../middlewares/userexists.js");

const saltRounds = 10;

async function signup(req, res,next) {
    try {
console.log(req.body);
        const {  email, password } = req.body;
        const userId = await generateUserId();
         

        if (result.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        // Hash password
        const hash = await bcrypt.hash(password, saltRounds);

        // Profile image (if uploaded)
      //  const profileImage = req.file ? req.file.filename : null;
        // Insert user
        const result = await pool.query(
            `INSERT INTO login_details
            (password, email, userid,is_verified)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [hash, email, userId, false]
        );
        if(result){
            next();
        }
        
        
    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
}
module.exports = signup;