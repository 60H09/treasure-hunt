const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
var md5 = require('md5');
const Swal = require('sweetalert2')
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
    const question = new Question({text:req.body.text,photo:req.body.photo,answer:req.body.answer,format:req.body.age,index:req.body.index})
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

var score = 0
var feedback=-1
    app.get("/",function(req, res){
    
    Question.find({},function(err,results){
    if(score!=results.length){
      res.render("index",{text:results[score].text,photo:results[score].photo,format:results[score].format,feedback:feedback})
    }
    else{
        res.render("vali",{message:"your treasure",link:"/treasure"})
        score = 0
    }
    })
})
    app.post("/",function(req, res){
        Question.find({},function(err,results){
        if(req.body.answer===results[score].answer){
            feedback =1
            score+=1
            res.redirect("/")     
       }
    
        else{
            feedback =0
            res.redirect("/")     

        
    }
    })
})


app.get("/treasure",function(req, res){
    res.render("treasure")
})

app.listen(3000, function(){
    console.log("listening")
})



