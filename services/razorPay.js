const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const razorpay = new Razorpay({
    key_id: "rzp_test_TFOIHhfym0VRnH",
    key_secret: "bi7jiK6nRE4QY3MLrrPef3uA"
});

module.exports = razorpay;
