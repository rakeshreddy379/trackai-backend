const jwt = require('jsonwebtoken')
async function setUid(result){
    const token=await jwt.sign({
        username:result.userName,
        email:result.email
    },'rjkfodbububdubirnpvikngbeorjbuolj')
    return token
}
function getUid(token) {
    try {
      const decoded = jwt.verify(token, 'rjkfodbububdubirnpvikngbeorjbuolj');
      return decoded;
    } catch (err) {
      console.error('JWT Verification Error:', err.message);
      throw new Error('Invalid token. Please login again.');
    }
  }
module.exports={setUid,getUid}