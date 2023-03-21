//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose')

const app = express();

mongoose.connect('mongodb+srv://admin:Test%40123@cluster0.urlcyfn.mongodb.net/todolist',{useNewUrlParser:true});

const todoSchema = new mongoose.Schema({
    name:String
});

const listSchema = new mongoose.Schema({
  name:String,
  defaultItem:[todoSchema]
})

const list = mongoose.model("List",listSchema)
const todo = mongoose.model('todo',todoSchema);



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res) {
  const day = date.getDate();
  todo.find({}).then((results)=>{
    res.render("list",{listTitle:day, newListItems:results})
  }).catch((err)=>{
    console.log(err);
  })

});

const item1 = new todo({
  name:"eat"
})
const item2 = new todo({
  name:"sleep"
})
const item3 = new todo({
  name:"conquor"
})

const defaultItemsarray = [item1,item2,item3]

app.post("/", function(req, res){
  const listTitle = req.body.list;
  const item = req.body.newItem;
  const newitem = new todo({
    name:item
  })
  if(listTitle == date.getDate()){
    newitem.save();
    res.redirect("/");
  }
  else{
    list.findOne({name:listTitle}).then((results)=>{
      results.defaultItem.push(newitem);
      results.save();
      res.redirect("/"+listTitle)
    }).catch((err)=>{
      console.log(err);
    })
  }
  
});

app.post("/delete",function(req,res){
  const item = req.body.checkbox;
  const listName = req.body.listname;
  if(listName === date.getDate()){
    todo.deleteOne({_id:item}).then(console.log("successfull"));
    res.redirect("/");
  }
  else{
    list.findOne({name:listName}).then((results)=>{
      for(var i=0;i<results.defaultItem.length;i++){
        if(results.defaultItem[i]._id==item){
          const x = results.defaultItem.splice(i,1);
          break;
        }
      }
      results.save();
      res.redirect("/"+listName);
    }).catch((err)=>{
      console.log(err);
    })
  }
  
});


app.get("/:work", function(req,res){
  list.find({name:req.params.work}).then((results)=>{
    if(results.length==0){
      const newlist = new list({
        name:req.params.work,
        defaultItem:defaultItemsarray
      })
      newlist.save();
      list.findOne({name:req.params.work}).then((results)=>{
        res.redirect("/"+req.params.work);
      })
    }
    else{
      list.findOne({name:req.params.work}).then((results)=>{
        res.render("list", {listTitle: req.params.work, newListItems: results.defaultItem});
      })
    }
    
  })
  
});


app.listen(process.env.PORT || 1500, function() {
  console.log("Server started on port 3000");
});
