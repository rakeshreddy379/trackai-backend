const bcrypt = require("bcrypt");
const pool = require("../services/postgre.js");
const userExists = require("../middlewares/userexists.js");
const generateUserId=require('./generateUserId.js')

const saltRounds = 10;

async function signup(req, res,next) {
    try {
console.log(req.body);
        const {email, password } = req.body;
        const userId = await generateUserId();
         

       const gmail = await pool.query(
    "SELECT * FROM login_details WHERE email = $1",
    [email]
);

if (gmail.rows.length > 0) {
    // Email exists
    return res.status(409).json({
        success: false,
        message: "Email already exists"
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
            [hash, email, userId, true]
        );
        
console.log("After insert");
console.log(result);
        if(result){
            req.userId=userId;
            console.log("going to otpsent");
            
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
