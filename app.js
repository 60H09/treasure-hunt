const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
var session = require('express-session')
var passport = require("passport");
var passportLocalMongoose = require("passport-local-mongoose");
mongoose.connect("mongodb://localhost:27017/questionDB", { useUnifiedTopology: true , useNewUrlParser: true, useFindAndModify: false  }) //mongoose connecting
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('views', './views');
app.set('view engine', 'ejs')

app.use(session({
    secret: 'Secretoski',
    resave:false,
    saveUninitialized:false
}))


app.use(passport.initialize());
app.use(passport.session())


const questionSchema =new mongoose.Schema({text:String,photo:String,answer:String,format:String,hint1:{type:String,default:"/nohint"},hint2:String})
const Question = mongoose.model('Question',questionSchema)

const userSchema = new mongoose.Schema({username:String,password:String,question:[questionSchema]})
userSchema.plugin(passportLocalMongoose)
const User = mongoose.model('User',userSchema)
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});




app.get("/create-new-account", function(req, res) {
  res.render("createacc",{place:"create-new-account",comment:"Have an account??",link:"/login"})
})
app.post("/create-new-account", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/create-new-account");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/add");
          });
        }
      });
})

app.get("/login",function(req,res){
  res.render("createacc",{place:"login",comment:"Don't have an account??",link:"/create-new-account"})
})
app.post("/login", function(req, res){

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/add");
        });
      }
    });
  
  });

app.get("/add/",function(req, res){
    if(req.isAuthenticated()){
        res.render("add",{name:req.user.username,gameid:req.user.id})
    }
    else{
      res.render("createacc",{place:"login",comment:"hey",link:"/create-new-account"})
    }
    
})

app.post("/add",function(req, res){
    const question = new Question({text:req.body.text,photo:req.body.photo,answer:req.body.answer,format:req.body.age,index:req.body.index,hint1:req.body.hint1,hint2:req.body.hint2})
    User.findOne({_id:req.user.id},function(err,found){
        found.question.push(question)
        found.save()
        res.redirect("/add/view/")
    })
})

app.get("/add/view",function(req, res){
    if(req.isAuthenticated()){
    User.findOne({_id:req.user.id},function(err,found){
        res.render("view",{things:found.question,name:req.user.username,gameid:req.user.id})
    })
}
else{
  res.render("createacc",{place:"login",comment:"hey",link:"/create-new-account"})
}
})



app.post("/delete",function(req, res){
    var delID=req.body.delete
    User.findOneAndUpdate({_id:req.user.id},{$pull:{question:{_id:delID}}},function(err,result){
        if(!err){
          res.redirect("/add/view")
        }
      })
    })

var score = 0
var feedback=-1
    app.get("/play/:gameid",function(req, res){
    console.log(score)
    User.findById(req.params.gameid,function(err,result){
    var results = result.question
    console.log(results.length)
    if(score!=results.length){
      res.render("index",{text:results[score].text,photo:results[score].photo,format:results[score].format,feedback:feedback,hint1:results[score].hint1,hint2:results[score].hint2,id:req.params.gameid})
    }
    else{
        res.render("vali",{message:"Congrats Claim your treasure",link:"/treasure"})
        score = 0
    }
    })
})
    app.post("/play/:gameid",function(req, res){
        User.findById(req.params.gameid,function(err,result){
       var results = result.question
        if(req.body.answer===results[score].answer){
            feedback =1
            score+=1
            res.redirect("/play/"+req.params.gameid)     
       }
    
        else{
            feedback =0
            res.redirect("/play/"+req.params.gameid)     
    }
    })
})

app.get("/",function(req,res){
    res.render("opening windw")
})

app.post("/",function(req,res){
    adminName=req.body.adminName
    User.findOne({username:adminName},function(err,found){
       let adminID=found.id
       res.redirect("/play/"+adminID)
    })
})



app.get("/nohint",function(req, res){
    res.render("nohint")
})
app.get("/treasure",function(req, res){
    res.render("treasure")
})

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });

app.listen(3000, function(){
    console.log("listening")
})



