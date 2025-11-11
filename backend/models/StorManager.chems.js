const mongoose = require("mongoose")

const storemanagerSchema= new mongoose.Schema({
    name:{
        type:String,
    },
    username:{
        type:String,
        required:true,
        unique: true 
    },
    password:{
        type:String,
        required:true
    },
    token: { 
        type: String 
    }
},{timestamps:true})

storemanagerSchema.index({ username: 1 }, { unique: true });
const storeManager = mongoose.model("storemanager",storemanagerSchema)
module.exports = storeManager