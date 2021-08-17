const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
var session = require('express-session')
var passport = require("passport");
var passportLocalMongoose = require("passport-local-mongoose");
mongoose.connect("mongodb+srv://adminRohan:test@cluster0.lmuy0.mongodb.net/questionDB", { useUnifiedTopology: true , useNewUrlParser: true, useFindAndModify: false  }) //mongoose connecting
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//app.set('views', '/views');
app.set('view engine', 'ejs')

app.use(session({
    secret:'process.env.key',
    resave:false,
    saveUninitialized:false
}))


app.use(passport.initialize());
app.use(passport.session())

const playerSchema = new mongoose.Schema({name:String,score:{type:Number,default:0},email:String,attempts:{type:Number,default:0},time:String,comment:String})
const Player = mongoose.model('Player', playerSchema)

const questionSchema =new mongoose.Schema({text:String,photo:String,answer:String,format:String,hint1:{type:String,default:"/nohint"},hint2:String})
const Question = mongoose.model('Question',questionSchema)

const userSchema = new mongoose.Schema({username:String,password:String,question:[questionSchema],player:[playerSchema]})

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
  User.findOne({username:req.body.username},function(err,found){
    if(!found){
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
    }
    else{
      res.render("vali",{message:"That name already exists try a diffrent one",link:"/create-new-account"})
    }
  })
    
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
      res.render("createacc",{place:"login",comment:"Don't have an account??",link:"/create-new-account"})
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

app.get("/play/:gameid/:playerName/comments",function(req,res){
  res.render("comments",{playername:req.params.playerName,gameid:req.params.gameid})
})
app.post("/play/:gameid/:playerName/comments",function(req,res){
  User.findOne({username:req.params.gameid},function(err,found){
     for(var i = 0;i<found.player.length;i++){
       if(found.player[i].name === req.params.playerName){
         found.player[i].comment = req.body.comment;
         found.save()
         res.redirect("/")
       }
     }
  })
})

app.get("/view-comments",function(req, res){
  if(req.isAuthenticated()){
  User.findOne({_id:req.user.id},function(err,found){
      res.render("readcomments",{things:found.player})
  })
}
else{
res.render("createacc",{place:"login",comment:"If you dont have an account click here",link:"/create-new-account"})
}
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

var victory =["You've cracked it!!","You did it!!","congrats dude!!","Great Job!!","Seems like you are winning!!","right on!!","Question Slayer","I hear your roar","You are god damn right","You're a little scary sometimes, you know that? Brilliant ... but scary.","Rejoice You have cracked it!!" ]
var lost = ["try ,fail ,try harder","Come on you can do it","Don't ever give up","Think about your ninja way","Edison failed 1000 times","fail until you beat faliure","Keep trying!!","When in doubt, go to the library.",] 
    

var feedback=-1
    app.get("/play/:gameid/:playerName",function(req, res){
      var commentlink = "/play/"+req.params.gameid+"/"+req.params.playerName+"/comments";
      var victoryNumber = Math.floor(Math.random() * victory.length)
      var lostNumber = Math.floor(Math.random() * lost.length)
      User.findOne({username:req.params.gameid},function(err,result){
        for(var i=0;i<result.player.length;i++){
       if (result.player[i].name==req.params.playerName){
        var score = result.player[i].score
        var results = result.question
        if(score!=results.length){
          res.render("index",{text:results[score].text,photo:results[score].photo,format:results[score].format,feedback:feedback,hint1:results[score].hint1,hint2:results[score].hint2,id:req.params.gameid,name:result.username,playerName:req.params.playerName,victory:victory[victoryNumber],lost:lost[lostNumber]})
        }
        else{
          res.render("treasure",{commentlink:commentlink})
        }
      }
      }

    })
})
    app.post("/play/:gameid/:playerName",function(req, res){
      User.findOne({username:req.params.gameid},function(err,result){
          for(var i=0;i<result.player.length;i++){
            if (result.player[i].name==req.params.playerName){
              var score = result.player[i].score
              const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
              var results = result.question
              if(_.lowerCase(req.body.answer)===_.lowerCase(results[score].answer)){
                  feedback =1
                  score+=1
                  result.player[i].time = str
                  result.player[i].score=score
                  result.player[i].attempts+=1
                  result.save()
                  res.redirect("/play/"+req.params.gameid+"/"+req.params.playerName)     
             }
          
              else{
                  result.player[i].attempts+=1
                  result.save()
                  feedback =0
                  res.redirect("/play/"+req.params.gameid+"/"+req.params.playerName)     
          }
            }
          }
          
    })
})

app.get("/",function(req,res){
    res.render("opening windw")
})

app.post("/",function(req,res){
    var adminName=req.body.adminName
    User.findOne({username:adminName},function(err,found){
      if(!found){
        res.render("vali",{message :"Game not found",link:"/"},)
      }
      else{
       let adminID=found.username
       res.redirect("/register/"+adminID)}
    })
})

app.get("/register/:gameid",function(req,res){
  res.render("register",{id:req.params.gameid})
})
app.post("/register/:gameid",function(req,res){
  var status = 1;
  const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const player = new Player({name:req.body.playerName,email:req.body.playerEmail,time:str})
  User.findOne({username:req.params.gameid},function(err,result){
      for(var i=0;i<result.player.length;i++){
        if(result.player[i].email==req.body.playerEmail){
          if(result.player[i].name==req.body.playerName){
            status=2
        }
        else{
          console.log("email exist but has logged in once")
          status=-1
        }
      }
      else{
        if(result.player[i].name==req.body.playerName){
        status = -2
        }
        else{
      status =1 
        }
      }
    }
    if(status===1){
      console.log("new player")
      result.player.push(player)
      result.save()
      res.redirect("/play/"+req.params.gameid+"/"+req.body.playerName)   
      }
     else if(status===2){
      console.log("existing player")
      res.redirect("/play/"+req.params.gameid+"/"+req.body.playerName)   
     } 
     else if(status===-1){
       res.render("vali",{message:"email id exists",link:"/register/"+req.params.gameid})
     }
     else{
       res.render("vali",{message:"that name exists try a diffrent one",link:"/register/"+req.params.gameid})
     }
       
  })
})
app.get("/nohint",function(req, res){
    res.render("nohint")
})


app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });

app.get("/view-people",function(req, res){
  if(req.isAuthenticated()){
  User.findOne({_id:req.user.id},function(err,found){
    res.render("viewPeople",{things:found.player,name:req.user.username,gameid:req.user.id,length:found.question.length})
    })
}
else{
  res.render("createacc",{place:"login",comment:"hey",link:"/create-new-account"})
}
})



app.post("/delete/people",function(req, res){
  var delID=req.body.delete
  User.findOneAndUpdate({_id:req.user.id},{$pull:{player:{_id:delID}}},function(err,result){
      if(!err){
        res.redirect("/view-people")
      }
    })
  })

app.get("/error-iv0iv",function(req,res){
  res.render("createacc",{place:"error404",link:"/",comment:"if you are not you get the fuck away"})
})
app.post("/error404",function(req,res){
  if(req.body.username=="admin" && req.body.password=="03e89d0309c4fefb461be36b78b8fe93"){
    User.find({},function(err,found){
      res.render("admin",{things:found})
    })
  }
  else{
    res.redirect("/get-the-fuck-out-before-i-call-the-cops")
  }
})

app.post("/delete/game",function(req,res){
  var delID=req.body.delete
  User.findByIdAndRemove(delID,function(err){
    if(!err){
      res.redirect("/error-iv0iv")
    }
    else{
      console.log("err")
    }
  })
})

app.use(function(req,res){
  res.status(404).render('what');
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
    console.log("listening")
})