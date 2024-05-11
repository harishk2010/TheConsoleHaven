const userHelper = require('../../helpers/user_helper');
const { User } = require('../../models/userSchema');
const argon = require('argon2');


let otp;
let email;

/////////render forgot otp mail page

const submitMail= async(req,res)=>{
    try {

        const mailError='Invalid User'
        if (req.session.mailError) {
            res.render('user/forgotPassword/mailSubmit',{mailError})
            req.session.mailError=false

            
        } else {
            res.render('user/forgotPassword/mailSubmit')
            
        }
        
        
    } catch (error) {
        console.log(error)
    }
}

///// submit forgot password request

const submitMailPost=async(req,res)=>{
    try {
        email=req.body.email
        const userData=await User.findOne({email:email}).lean()
        console.log(userData)
        if(userData){
            otp=await userHelper.verifyEmail(email)
            console.log(otp)
            res.redirect('/otp')
        }else{
            req.session.mailError=true
            res.redirect('/forgotPassword')
        }

        
    } catch (error) {
        console.log(error)
        
    }
}

const forgotOtppage=async(req,res)=>{
    try {
        let otpErr = 'Incorrect otp..!!';

        if (req.session.otpErr) {
            console.log("OTP Error:", req.session.otpErr); // Debugging statement
            res.render('user/forgotPassword/submitOtp', { otpErr });
        } else {
            res.render('user/forgotPassword/submitOtp');
        }
    } catch (error) {
        console.log(error);
    }
}
const forgotOtpSubmit=async(req,res)=>{
    let enteredOtp = req.body.otp;

    console.log("Entered OTP:", enteredOtp); // Debugging statement
    console.log("Stored OTP:", otp); // Debugging statement

    if (enteredOtp === otp) {
        res.redirect('/resetPassword');
    } else {
        req.session.otpErr = true;
        console.log("Incorrect OTP. Redirecting to /otp"); // Debugging statement
        res.redirect('/otp');
    }
}

const resetPasswordPage=async(req,res)=>{
    try {
        res.render('user/forgotPassword/resetPassword');
    } catch (error) {
        console.log(error);
    }


}
const resetPassword=async(req,res)=>{
    try {
        // const newPassword  = req.body.password
        // const hashedPassword = await userHelper.hashPassword(newPassword)
        hashedPassword = await userHelper.hashpassword(req.body.password);

        await User.updateOne({ email: email }, { $set: { password: hashedPassword } });
        req.session.newPas = true;
        res.redirect('/login');
    } catch (error) {
        console.log(error);
    }

}

module.exports={
    submitMail,
    submitMailPost,
    forgotOtppage,
    forgotOtpSubmit,
    resetPassword,
    resetPasswordPage
}