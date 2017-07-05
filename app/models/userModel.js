var mongoose=require('mongoose');

var Schema=mongoose.Schema;

var userSchemea=new Schema({
    userName:{type:String,default:'',required:true,unique:true},
    email:{type:String,default:'',required:true,unique:true},
    password:{type:String,default:'',required:true},
    createdOn:{type:Date,default:Date.now()},
});

mongoose.model('User',userSchemea);