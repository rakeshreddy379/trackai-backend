const pool = require("../services/postgre");
async function nutrientStreaks(userid){
    
   const result = await pool.query(
        `
        SELECT 
            water_ml from water_intake where intake_date=CURRENT_DATE and userid=$1
        `,
        [userid]
        );


        const today_water_intake =
    result.rows.length > 0 ? Number(result.rows[0].water_ml) : 0;

        // Get current targets
        const profile = await pool.query(
        `
        SELECT 
           
             
            water_ml
            
        FROM profile
        WHERE userid=$1
        `,
        [userid]
        );
        
       
       const water_ml = Number(profile.rows[0].water_ml);
        //get todays color
        const today = await pool.query(`
    SELECT streakscore,streakid, color
    FROM water_streaks
    WHERE userid = $1
      AND streak_day = CURRENT_DATE
    LIMIT 1
`, [userid]);
const color = today.rows.length > 0 ? today.rows[0].color : null;
const todaystreakid = today.rows.length > 0 ? today.rows[0].streakid : null;
        const streakid = Math.floor(10000000 + Math.random() * 900000000);
      const yesterday = await pool.query(`
    SELECT streakscore
    FROM water_streaks
    WHERE userid = $1
      AND streak_day = CURRENT_DATE - INTERVAL '1 day'
    LIMIT 1
`, [userid]);

const streakscore = yesterday.rows.length > 0
    ? Number(yesterday.rows[0].streakscore) + 1
    : 1;
   
        if(today_water_intake>=water_ml){
         if (today.rows.length == 0) {
        
            await pool.query(
   `INSERT INTO water_streaks (
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
           
            await pool.query(`update water_streaks set streakscore=$1,color=$2 where streakid=$3`,[streakscore,'green',todaystreakid])
        }
        
    }
        }
        else{
          if (today.rows.length == 0) {
        
            await pool.query(
    `INSERT INTO water_streaks (
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
            await pool.query(`update water_streaks set streakscore=$1,color=$2 where streakid=$3`,[streakscore-1,'yellow',todaystreakid])
        }
    }
    }}
   

module.exports={nutrientStreaks}