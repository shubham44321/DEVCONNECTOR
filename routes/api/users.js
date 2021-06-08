const express = require('express');

const gravatar = require('gravatar');
const jwt = require("jsonwebtoken");
const config = require('config');

//creating a router
const router = express.Router();
const {check,validationResult} = require('express-validator');

const User = require('../../models/User'); //importing model 

//@route            GET api/users
//@description      Test route
//@access           Public
router.get('/',(req,res) =>{
    res.send("User Route");
});

//@route            POST api/registerUser 
//@description      User registration route.
//@access           Public
router.post('/registerUser',[
    check('name','Name is required').not().isEmpty(),
    check('email','Please include a valid email-id').isEmail(),
    check('password',"Please enter a password with 6 or more characters").isLength({min:6})
],async (req,res) => {
    //console.log(req.headers);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const {name,email,password} = req.body; //destructuring object
    
    try {

        //See if user exists
        const user = await User.findOne({
            email
        });

        if(user){
            return res.status(400).json({
                errors:[{
                    msg:"User already exists."
                }]
            });
        }

        //Get users gravatar
        const avatar = gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        });
        
        //saving user to Database
        const newUser = await User.create({
            name,
            email,
            password,
            avatar
        });

        //Return jsonWebToken
        const payload = {
            user : {
                id : newUser.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn:360000},
            (err,token) => {
                if(err) throw err;
                res.json({token});
            }
        );
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Server error");
    }
});


module.exports = router;