//creating order for razorpay payment gateway
const razorpay = require("../services/razorpay");
const pool = require("../services/postgre");

async function createOrder(req, res) {
    try {
        const { userid, plan_id } = req.body;
console.log("Received request to create order:", { userid, plan_id });
        // Get plan from database
        const planResult = await pool.query(
            "SELECT * FROM subscription_plans WHERE plan_id = $1",
            [plan_id]
        );

        if (planResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Plan not found"
            });
        }

        const plan = planResult.rows[0];

        // Razorpay expects amount in paise
        const options = {
            amount: plan.price * 100, // ₹69 becomes 6900 paise
            currency: "INR",
            receipt: `receipt_${userid}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
         console.log("Razorpay order created:", order);
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planName: plan.plan_name,
            price: plan.price
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = createOrder;