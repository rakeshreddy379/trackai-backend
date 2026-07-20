const crypto = require("crypto");
const pool = require("../services/postgre");

async function verifyPayment(req, res) {
    try {
        const {
            userid,
            plan_id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Create expected signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // Verify signature
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Get plan details
        const planResult = await pool.query(
            "SELECT * FROM subscription_plans WHERE plan_id = $1",
            [plan_id]
        );

        const plan = planResult.rows[0];

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        // Save subscription in database
        await pool.query(
            `INSERT INTO user_subscriptions
            (userid, plan_id, payment_id, order_id, amount, status, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                userid,
                plan_id,
                razorpay_payment_id,
                razorpay_order_id,
                plan.price,
                "ACTIVE",
                startDate,
                endDate
            ]
        );

        res.status(200).json({
            success: true,
            message: "Subscription activated successfully",
            expires: endDate
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = verifyPayment;