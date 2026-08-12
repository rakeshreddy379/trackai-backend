const bcrypt = require("bcrypt");
const pool = require("../services/postgre");
const setUid=require("../services/auth").setUid;
async function login(req, res,next) {
    try {
        const { email, password } = req.body;
        console.log('login came ',email,password)
        const result = await pool.query(
            `SELECT *
             FROM login_details
             WHERE email = $1`,
            [email]
        );
        console.log(result.rows[0])
//need to check if the user is verified or not before allowing login
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = result.rows[0];
        console.log(user)
        const db= await pool.query(`SELECT current_database()`)
        console.log(db)
        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Invalid password"
            });
        }
        if(user.is_verified==false){
           next()    
        }
        else{
        const token=setUid(user);
         res.cookie('usertoken', token, { httpOnly: false });
         
         console.log("success")
        return res.status(200).json({
            success: true,
            message: "Login successful",
            userid: user.userid,
            
        });
    }
    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

}

module.exports = login;
