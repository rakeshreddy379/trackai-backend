const pool = require("../services/postgre");
async function nutrientStreaks(userid){
    
   const result = await pool.query(
        `
        SELECT 
            COALESCE(SUM((food->>'protein')::numeric),0) AS total_protein,
            COALESCE(SUM((food->>'carbs')::numeric),0) AS total_carbs,
            COALESCE(SUM((food->>'fat')::numeric),0) AS total_fat
        FROM analyzed_foods,
        json_array_elements(detected_foods::json) AS food
        WHERE userid=$1
        AND analyzed_at::date=CURRENT_DATE;
        `,
        [userid]
        );


        const {
           
            total_protein,
            total_carbs,
            total_fat
        } = result.rows[0];

        // Get current targets
        const profile = await pool.query(
        `
        SELECT 
           
             protein,
            carbs,            fat,
            water_ml,
            goal
        FROM profile
        WHERE userid=$1
        `,
        [userid]
        );
        
        const protein = Number(profile.rows[0].protein);
        const carbs = Number(profile.rows[0].carbs);
        const fat = Number(profile.rows[0].fat);
        const water_ml=profile.rows[0].water_ml
        //get todays color
        const today = await pool.query(`
    SELECT streakscore,streakid, color
    FROM nutrients_streaks
    WHERE userid = $1
      AND streak_day = CURRENT_DATE
    LIMIT 1
`, [userid]);
const color = today.rows.length > 0 ? today.rows[0].color : null;
const todaystreakid = today.rows.length > 0 ? today.rows[0].streakid : null;



        
        const streakid = Math.floor(10000000 + Math.random() * 900000000);
      const yesterday = await pool.query(`
    SELECT streakscore
    FROM nutrients_streaks
    WHERE userid = $1
      AND streak_day = CURRENT_DATE - INTERVAL '1 day'
    LIMIT 1
`, [userid]);

const streakscore = yesterday.rows.length > 0
    ? Number(yesterday.rows[0].streakscore) + 1
    : 1;
   
        if(total_carbs>=carbs && total_protein>=protein && Math.abs(total_fat-fat)<=3){
         if (today.rows.length == 0) {
        
            await pool.query(
   `INSERT INTO nutrients_streaks (
    streakid,
    userid,
    streakscore,
    streak_day,
    streak_date,
    color
)VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIMESTAMP, $4)
    
`, [streakid, userid, streakscore, 'green']);
            }
 else{
        
        if(color=='green'){
            //do nothing
        }
        else{
           
            await pool.query(`update nutrients_streaks set streakscore=$1,color=$2 where streakid=$3`,[streakscore,'green',todaystreakid])
        }
        
    }
        }
        else{
          if (today.rows.length == 0) {
        
            await pool.query(
    `INSERT INTO nutrients_streaks (
    streakid,
    userid,
    streakscore,
    streak_day,
    streak_date,
    color
)
VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIMESTAMP, $4)
   
`, [streakid, userid, streakscore, 'yellow']);
        }
    
    else{
        if(color!='yellow'){
            await pool.query(`update nutrients_streaks set streakscore=$1,color=$2 where streakid=$3`,[streakscore-1,'yellow',todaystreakid])
        }
    }
    }}
   

module.exports={nutrientStreaks}