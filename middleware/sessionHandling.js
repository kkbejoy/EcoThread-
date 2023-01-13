
module.exports = {
    //checking the user login and signup page session
    authenticationCheck: (req, res, next) => {
        if (req.session.user && req.cookies.user_sid) {
            res.redirect('/');
        }
        else {
            next();
        }

    },
// checking for usr session 

    userChecking :(req, res, next) =>{
        if(req.session.user && req.cookies.user_sid){
            next()
        }
        else{
            res.redirect('/login');
        }
    },
 
// checking for the session for admin to render login page 
    adminAuthenticationCheck: (req, res, next) => {
        if (req.session.admin && req.cookies.user_sid) {
            res.redirect('/admin')
        }
        else {
            next();
        }
    },
//checking wheather the admin is present or not and loading the pages 
    checkingAdmin: (req, res, next) => {
        if (req.session.admin && req.cookies.user_sid) {
            console.log("checkingAdmin")
            console.log(req.cookies)
            next();
        }
        else{

            //this will work like loop if put in admin root route without session data and cookie...!!!!!!
            res.redirect('/admin');
            console.log(req.cookies)
            console.log(req.session.user_sid)
            console.log("checkingAdminRedirect")
        }
    }
}