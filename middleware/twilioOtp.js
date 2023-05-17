require('dotenv').config();
// const { response } = require('../app');
const user_helper = require('../helpers/userHelpers');


const accountSid = process.env.TWILIO_ACCOUNT_SID  // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN   // Your Auth Token from www.twilio.com/console
const serviceSid = process.env.TWILIO_SERVICE_SID ; // My Service SID from www.twilio.com/console

const client = require('twilio')(accountSid, authToken)

module.exports = {

// api for sending otp to the user mobile number....
    send_otp: (mobileNo) => {
        return new Promise((resolve, reject) =>{
            client.verify
            .services(serviceSid)
            .verifications
            .create({
                to : `+91${mobileNo}`,
                channel :'sms'
            })
            .then((verifications) => {
               resolve(verifications.sid)
            }).catch((error)=>{
                console.log(error);
            });
        })
        
    },
// api for verifying the otp recived by the user 
    verifying_otp :(mobileNo,otp) =>{
        return new Promise((resolve, reject) =>{
            // if (typeof otp !== 'number') {
            //     reject("OTP must be a number");
            //     return;
            //   }
              if (otp.length < 4) {
                reject("OTP must be at least 4 digits long");
                return;
              }
            client.verify
            .services(serviceSid)
            .verificationChecks
            .create({
                to : `+91${mobileNo}`,
                code : otp
            })
            .then((verifications) => {
               resolve(verifications)
            }).catch((error)=>{
                console.log(error);
            })
        })
    }
}