const bcrypt = require("bcrypt");
const pool = require("../services/postgre");
const setUid=require("../services/auth").setUid;
async function login(req, res,next) {
    try {
        const { email, password } = req.body;
        console.log('login came ')
        const result = await pool.query(
            `SELECT *
             FROM login_details
             WHERE email = $1`,
            [email]
        );
//need to check if the user is verified or not before allowing login
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = result.rows[0];

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
         await pool.query(
`
INSERT INTO login_logs
(
 userid,
 login_type,
 status,
 ip_address,
 user_agent
)
VALUES($1,$2,$3,$4,$5)
`,
[
 user.userid,
 "email password",
 "success",
 req.ip || null,
 req.headers["user-agent"] || null
]);
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
