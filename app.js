const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
var md5 = require('md5');
mongoose.connect("mongodb://localhost:27017/questionDB", { useUnifiedTopology: true , useNewUrlParser: true }) //mongoose connecting
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('views', './views');
app.set('view engine', 'ejs')

questionSchema = {text:String,photo:String,answer:String,format:String}
Question = mongoose.model('Question',questionSchema)

app.get("/34ec78fcc91ffb1e54cd85e4a0924332",function(req, res){
    res.render("add")
})

app.post("/34ec78fcc91ffb1e54cd85e4a0924332",function(req, res){
    const question = new Question({text:req.body.text,photo:req.body.photo,answer:req.body.answer,format:req.body.age})
    question.save(function(err){
        if(!err){
            console.log("pushed")
        }
        else{
            console.log(err)
        }
    })
    res.redirect("/34ec78fcc91ffb1e54cd85e4a0924332/view")
})

app.get("/34ec78fcc91ffb1e54cd85e4a0924332/view",function(req, res){
    Question.find({},function(err,results){
    res.render("view",{things:results})
})
})



app.post("/delete",function(req, res){
var delID=req.body.delete
Question.deleteOne({_id:delID},function(err){  //id vech finding then deleting
    if(!err){
        console.log("popped")
     return res.redirect("/34ec78fcc91ffb1e54cd85e4a0924332/view")
   }
 })
})

app.get("/", (req, res) =>{ 
    res.render("vali",{message:"welcome",link:"/question/"+md5(0)})
})


Question.find({},function(err,results){
     results.forEach(function(result,index){
        app.get("/question/"+md5(index),function(req, res){
            res.render("index",{text:result.text,photo:result.photo,format:result.format,code:md5(index)})
        })
        app.post("/question/post/"+md5(index),function(req, res){
            if(_.lowerCase(req.body.answer)==_.lowerCase(result.answer)){
                res.render("vali",{message:"congrats Next🎉👌✨",link:"/question/"+md5(index+1)})
            }
            else{
                res.render("vali",{message:"sorry😢😢",link:"/question/"+md5(index)})
            }
        })
    })
    app.get("/question/"+md5(results.length),function(req, res){
        res.render("vali",{message:"YAY you've cracked it👏👏🎉👌👌🎉🎉🎊 click here",link:"/treasure"})
    })
   
})

app.get("/treasure",function(req, res){
    res.render("treasure")
})



app.listen(3000, function(){
    console.log("listening")
})



