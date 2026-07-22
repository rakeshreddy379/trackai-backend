const updateTargets = require("../services/updateTargets");
const { pool } = require("../services/postgre.js");

async function insertFoodLog(req,res){

try{

const { userid } = req.userId;
const { food_nutrients, meal_type } = req.food_log;


await pool.query(
`
INSERT INTO food_logs
(userid, detected_foods, meal_type, analyzed_at)
VALUES($1,$2,$3,$4)
`,
[
userid,
food_nutrients,
meal_type,
new Date()
]
);


// update target
await updateTargets(userid);


res.status(201).json({
 message:"Food log inserted successfully"
});


}catch(err){
console.log(err);
res.status(500).json({
error:"Internal server error"
});
}

}
async function updateFoodLog(req,res){

const {userid}=req.userId;

await pool.query(
`
UPDATE food_logs
SET detected_foods=$1
WHERE id=$2 AND userid=$3
`,
[
JSON.stringify(req.body.detected_foods),
req.body.foodlogid,
userid
]
);


// recalculate targets
await updateTargets(userid);


res.json({
message:"Food updated"
});

} 
async function deleteFoodLog(req, res) {
    try {
        const { userid } = req.userId;
        const { id } = req.params;


        // Delete food log
        const result = await pool.query(
            `
            DELETE FROM food_logs
            WHERE id=$1 AND userid=$2
            RETURNING *
            `,
            [
                id,
                userid
            ]
        );


        if(result.rows.length === 0){
            return res.status(404).json({
                message:"Food log not found"
            });
        }


        // Recalculate targets after deleting
        await updateTargets(userid);


        res.status(200).json({
            message:"Food log deleted successfully"
        });


    } catch(err){
        console.error("Delete food log error:",err);

        res.status(500).json({
            error:"Internal server error"
        });
    }
}

module.exports = {
insertFoodLog,
updateFoodLog,
deleteFoodLog
};