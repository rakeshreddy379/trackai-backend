const {pool} = require("../services/postgre");
const bcrypt = require("bcrypt");
async function resetPassword(req, res) {
    try {
        const { userid, newPassword } = req.body;   
        const saltROunds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltROunds);
        const result = await pool.query('UPDATE login_details SET password = $1 WHERE id = $2', [hashedPassword, userid]);
        res.status(200).json({ msg: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}
module.exports = resetPassword;