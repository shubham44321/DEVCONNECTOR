const express = require('express');
//creating a router
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const {check,validationResult} = require("express-validator");
//accessing auth middleware
const auth = require('../../middleware/auth');
//accessing user model
const User = require("../../models/User");

//@route            GET api/auth
//@description      Authenticate user and login
//@access           Public
router.get('/',auth,async (req,res) =>{
    //res.send("Auth Route");
    // const user = await User.findOne({
    //     _id : req.user.id,
    // });
    try {
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            res.status(401).json({msg:"User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

//@route            POSt api/login
//@description      Login route
//@access            
router.post('/Login',[
    check('email','Please include a valid email-id').isEmail(),
    check('password',"Password is required" ).exists()
],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }
    const {email,password} = req.body;
    try {
        const user = await User.findOne({
            email
        });
        if(user){
            const isValidPass =  await user.comparePasswords(password);
            if(isValidPass){
                const payload = {
                    user : {
                        id : user.id
                    }
                };
                jwt.sign(
                    payload,
                    config.get('jwtSecret'),
                    {expiresIn:360000},
                    (err,token) => {
                        if(err) throw err;
                        res.json({token});
                    }
                );
            }
            else{
                res.status(400).json(
                    {
                        errors:[
                            {msg:"Invalid Username or password"}
                        ]
                    }
                );
            }
        }
        else{
            res.status(400).json(
                {
                    errors:[
                        {msg:"Invalid Username or password"}
                    ]
                }
            );
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Server error");
    }
    
});
module.exports = router;