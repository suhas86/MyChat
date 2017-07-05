var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var messageModel=new Schema({
    userName:{type:String,default:'',required:true},
    message:{type:String,default:''},
    createdDate:{type:String,default: Date.now}
});

mongoose.model('Message',messageModel);