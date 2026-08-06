const {updateTargets} = require("../components/updateTargets");
const pool = require("../services/postgre");

async function insertFoodLog(req,res){

try{

const { userid } = req.body;
const { food_nutrients, meal_type } = req.body;
console.log(food_nutrients);
console.log(typeof food_nutrients);



await pool.query(
`
INSERT INTO analyzed_foods
(userid, detected_foods, meal_type, analyzed_at)
VALUES($1,$2,$3,$4)
`,
[
userid,
JSON.stringify(food_nutrients, null, 2),
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
 try{
const {userid,analysis_id}=req.body;
 const id=analysis_id

await pool.query(
`
UPDATE analyzed_foods
SET detected_foods=$1
WHERE id=$2 AND userid=$3
`,
[
JSON.stringify(req.body.detected_foods),
analysis_id,
userid
]
);


// recalculate targets
await updateTargets(userid);


res.json({
message:"Food updated"
});
 }catch(err){
  console.log('updated foodlogs error')
  res.status(500).json({msg:'internal server'})
} 
}
async function deleteFoodLog(req, res) {
    try {
        const { userid } = req.body;
        const { analysis_id  } = req.body;
const id=analysis_id 

        // Delete food log
        const result = await pool.query(
            `
            DELETE FROM analyzed_foods
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
