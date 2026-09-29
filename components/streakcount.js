const pool = require("../services/postgre");
async function streakCount(userid){
    
    const result = await pool.query(
        `
        SELECT 
            COALESCE(SUM((food->>'kcal')::numeric),0) AS total_calories
             FROM analyzed_foods,
        json_array_elements(detected_foods::json) AS food
        WHERE userid=$1
        AND analyzed_at::date=CURRENT_DATE;
        `,
        [userid]
        );
        const {total_calories}=result.rows[0]
        // Get current targets
        const profile = await pool.query(
        `
        SELECT 
            target_calories,
            goal
        FROM profile
        WHERE userid=$1
        `,
        [userid]
        );
        const targetCalories = Number(profile.rows[0].target_calories);
        //get todays color
        const today = await pool.query(`
    SELECT streakscore,streakid, color
    FROM streaks
    WHERE userid = $1
      AND streak_day = CURRENT_DATE
    LIMIT 1
`, [userid]);
const color = today.rows.length > 0 ? today.rows[0].color : null;
const todaystreakid = today.rows.length > 0 ? today.rows[0].streakid : null;
   


        const goal=profile.rows[0].goal;
        const streakid = Math.floor(10000000 + Math.random() * 900000000);
      const yesterday = await pool.query(`
    SELECT streakscore
    FROM streaks
    WHERE userid = $1
      AND streak_day = CURRENT_DATE - INTERVAL '1 day'
    LIMIT 1
`, [userid]);

const streakscore = yesterday.rows.length > 0
    ? Number(yesterday.rows[0].streakscore) + 1
    : 1;
   
        if(((Math.abs(targetCalories - total_calories) <= 199) &&  goal=='loss')||((targetCalories-199<total_calories || targetCalories<total_calories ) &&  goal=='gain')){
         if (today.rows.length == 0) {
        
            await pool.query(
   `INSERT INTO streaks (
    streakid,
    userid,
    streakscore,
    streak_day,
    streak_date,
    color
)VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIMESTAMP, $4)
    ON CONFLICT (userid, streak_day)
    DO NOTHING
`, [streakid, userid, streakscore, 'green']);
            }
 else{
        
        if(color=='green'){
            //do nothing
        }
        else{
           
            await pool.query(`update streaks set streakscore=$1,color=$2 where streakid=$3`,[streakscore,'green',todaystreakid])
        }
        
    }
        }
        else if(((Math.abs(targetCalories - total_calories) <= 350) &&  goal=='loss')||((targetCalories-250<total_calories ) &&  goal=='gain')){
          if (today.rows.length == 0) {
        
            await pool.query(
    `INSERT INTO streaks (
    streakid,
    userid,
    streakscore,
    streak_day,
    streak_date,
    color
)
VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIMESTAMP, $4)
    ON CONFLICT (userid, streak_day)
    DO NOTHING
`, [streakid, userid, streakscore, 'yellow']);
        }
    }
    else{
        if(color!='yellow'){
            await pool.query(`update streaks set streakscore=$1,color=$2 where streakid=$3`,[streakscore-1,'yellow',todaystreakid])
        }
    }
    }
   

module.exports={streakCount}