const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        required:true
    },
    email : {
        type: String,
        required:true,
        unique:true
    },
    avatar : {
        type:String
    },
    password : {
        type:String,
        require:true
    },
    date: {
        type : Date,
        default : Date.now
    }
});

UserSchema.pre('save', async function () {
    this.password = await this.generatePasswordHash()
});
  
  UserSchema.methods.generatePasswordHash = async function () {
    const saltRounds = 10
    return await bcrypt.hash(this.password, saltRounds)
  }
  
  UserSchema.methods.comparePasswords = async function (password) {
    return await bcrypt.compare(password, this.password)
  }

module.exports = User = mongoose.model('user',UserSchema); 