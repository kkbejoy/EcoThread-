const userSchema = require('../model/userModel');

//checking the user login and signup page session
const authenticationCheck = (req, res, next) => {
  try{
    if (req.session.user && req.cookies.user_sid) {
      res.redirect('/');
    } else {
      next();
    }
  }catch(error){
    console.log(error);
    res.render("error");
  }
 
};

//user HomePage Checking For access 

const userHomePageAuthCheck=async(req,res,next)=>{
    try{
      if (req.session.user && req.cookies.user_sid) {
        if (await userAccessCheck(req)) {
          console.log('From homPage auth check');
          next();
        } else {
          console.log('Logout route');
          res.redirect('/logout'); //To make sure the user logs out automatically when the admin blocks him
        }
      }else{
        next();
      }
    }catch(error){
      console.log(error);
      res.render("error")
    }
}

//User Access check

const userAccessCheck = async (req) => {
  try{
    let {
      user: { _id: userId },
    } = req.session;
    console.log(userId);
    const user = await userSchema.findById(userId);
    const userAccess = user.access;
    console.log('User Access Check' + userAccess);
    return userAccess;
  }catch(error){
    console.log(error);
    res.render("error");
  }
 
};

// checking for user session

const userChecking = async (req, res, next) => {
  try{
    if (req.session.user && req.cookies.user_sid) {
      if (await userAccessCheck(req)) {
        console.log('From auth check');
        next();
      } else {
        console.log('Logout route');
        res.redirect('/logout'); //To make sure the user logs out automatically when the admin blocks him
      }
    } else {
      res.redirect('/login');
    }
  }catch(error){
    console.log(error);
    res.render("error");
  }
 
};

// checking for the session for admin to render login page
const adminAuthenticationCheck = (req, res, next) => {
  try{
    if (req.session.admin && req.cookies.user_sid) {
      res.redirect('/admin');
    } else {
      next();
    }
  }catch(error){
    console.log(error);
    res.render("error")
  }
 
};

const adminAuthenticationCheckLogIn = (req, res, next) => {
  try{
    if (req.session.admin ) {
      console.log("Admin Logged In")
      res.redirect('/admin/dashboard');
    } else {
      // //this will work like loop if put in admin root route without session data and cookie...!!!!!!
      //    console.log(req.cookies)
      //    console.log(req.session.user_sid)
         console.log("checkingAdminRedirect")
      res.render('admin/adminlogin');
    }
  }catch(error){
    console.log(error);
    res.render("error");
    
  }
 
};
//checking wheather the admin is present or not and loading the pages
const checkingAdmin = (req, res, next) => {
  try{
    if (req.session.admin && req.cookies.user_sid) {
      console.log('checkingAdmin');
      console.log(req.cookies);
      next();
    } else {
      // //this will work like loop if put in admin root route without session data and cookie...!!!!!!
      console.log(req.cookies);
      console.log(req.session.user_sid);
      console.log('checkingAdminRedirect');
      res.redirect('/admin/login');
    }
  }catch(error){
    console.log(error);
    res.render("error")
  }
};

module.exports = {
  authenticationCheck,
  userHomePageAuthCheck,
  userChecking,
  adminAuthenticationCheck,
  adminAuthenticationCheckLogIn,
  checkingAdmin,
  checkingAdmin,
};
