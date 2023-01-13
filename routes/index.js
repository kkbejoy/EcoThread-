var express = require('express');
var router = express.Router();
var userHelpers=require('../helpers/userHelpers')
const session_check = require('../middleware/sessionHandling');
var producthelper=require('../helpers/producthelpers')




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('homepage', { title: 'Express' });
 
}),

router.get('/login',session_check.authenticationCheck,(req,res)=>
{
   res.render('user/userlogin')
    }
),
router.post('/login',(req,res)=>

    userHelpers.UserLogIn(req.body).then((response)=>
         {
          console.log(response)
         if(response.status)
        {
          console.log(req.session.user)
          req.session.loggedIn=true;
          req.session.user=response.validuser
              res.redirect('/')
               console.log(req.session.user)
         }
        else
        {
          //console.log(req.session)
         res.render('user/userlogin',{loginerr:true})
      }
  })
),
router.get('/signup',session_check.authenticationCheck,(req,res)=>{
    if(req.session.loggedIn){
        res.redirect('/')
      }
    else{
        res.render('user/usersignup')
      }
      }),
router.post('/signup',(req,res,next)=>{
     userHelpers.Signup(req.body).then((user)=>{ 
        let existingUser=user.status
        if(existingUser){
          res.render('user/products',{existingUser:true})
         }
        else{
          res.render('user/userlogin',{registered:true})
         }})
  }),

router.get('/products',(req,res)=>{
    producthelper.getAllProducts(req.body).then((product)=>{
        res.render('user/products',{product})
    })
}),

router.get('/wishlist',(req,res)=>{
    res.render('user/wishlist')
    }),

router.get('/logout',(req,res,next)=>{
  req.session.loggedIn=false;
  req.session.user=null
  res.redirect("/");
});


module.exports = router;
