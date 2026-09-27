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
            target_calories
            goal,
        FROM profile
        WHERE userid=$1
        `,
        [userid]
        );
        const targetCalories = Number(profile.rows[0].target_calories);
        const goal=profile.rows[0].goal;
        const streakid = Math.floor(10000000 + Math.random() * 900000000);
        const streakResult=await pool.query(`SELECT (streak_date - INTERVAL '1 day')::DATE
FROM streaks where userid=$1`,[userid])
const streakscore = streakResult.rows.length > 0
    ? Number(streakResult.rows[0].streakscore)
    : 0;
        if(((targetCalories-199>total_calories || total_calories<targetCalories+199) &&  goal=='loss')||((targetCalories-199>total_calories ) &&  goal=='gain')){
         await pool.query(
   `INSERT INTO streaks (
    streakid,
    userid,
    streakscore,
    streak_day,
    streak_date,
    color
)
VALUES (
    ${streakid},
    ${userid},
    ${streakscore + 1},
    CURRENT_DATE,
    CURRENT_TIMESTAMP,
    'green'
)
ON CONFLICT (userid, streak_day)
DO UPDATE SET
    streakscore = streaks.streakscore + 1,
    streak_date = CURRENT_TIMESTAMP,
    color = 'green';`
);
        }
        else if(((targetCalories-350>total_calories || total_calories<targetCalories+300) &&  goal=='loss')||((targetCalories-199>total_calories ) &&  goal=='gain')){
         await pool.query(
    `INSERT INTO streaks (
    streakid,
    userid,
    streakscore,
    streak_day,
    streak_date,
    color
)
VALUES (
    ${streakid},
    ${userid},
    ${streakscore + 1},
    CURRENT_DATE,
    CURRENT_TIMESTAMP,
    'green'
)
ON CONFLICT (userid, streak_day)
DO UPDATE SET
    streakscore = streaks.streakscore + 1,
    streak_date = CURRENT_TIMESTAMP,
    color = 'yellow';`
);
        }
}
module.exports={streakCount}