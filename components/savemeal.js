const pool = require("../services/postgre");

async function saveMeal(req, res, next) {
    try {
        const { userid, foodName, mealType } = req.body;

        let meal = foodName;

        if (typeof meal === "string") {
            meal = JSON.parse(meal);
        }

        await pool.query(
            `
            INSERT INTO mymeal
            (mealtype, userid, meal,mealdate)
            VALUES ($1, $2, $3,CURRENT_DATE)
            `,
            [
                mealType,
                userid,
                JSON.stringify(meal)
                
            ]
        );

        res.status(200).json({
            msg: "meal is saved"
        });

    } catch (error) {
        console.log("error at save meal", error);
        res.status(500).json({
            msg: "internal server error"
        });
    }
}

async function updateMeal(req,res){
 try{
const {userid,mealid,foodName}=req.body;
 

const result=
await pool.query(
`
UPDATE mymeal
SET meal=$1::json
WHERE mealid=$2 AND userid=$3
`,
[
JSON.stringify(foodName),
mealid,
userid
]
);



if (result.rowCount === 0) {
    return res.status(404).json({
        msg: "meal not found"
    });
}

res.json({
message:"meal updated"
});
 }catch(err){
  console.log('updated foodlogs error')
  res.status(500).json({msg:'internal server',error:err})
} 
}
async function deleteMeal(req, res) {
    try {
        const { userid, mealid } = req.body;

        const result = await pool.query(
            `
            DELETE FROM mymeal
            WHERE mealid = $1 AND userid = $2
            `,
            [mealid, userid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                msg: "meal not found"
            });
        }

        res.json({
            message: "meal deleted"
        });

    } catch (err) {
        console.log("delete meal error", err);

        res.status(500).json({
            msg: "internal server error"
        });
    }
}

module.exports = {saveMeal,updateMeal,deleteMeal};