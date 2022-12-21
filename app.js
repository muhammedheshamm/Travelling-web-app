const express = require('express');
const path = require('path');
const MongoClient= require('mongodb').MongoClient;
const app = express();
const alert = require('alert')
const session = require('express-session')
const flash = require('connect-flash');
let age = 1000 * 60 * 60 
let listOfWanttogo = []


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "secrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  cookie: { maxAge: age},
  resave: false
}));


app.get('/',(req,res) => {
  if(req.session.userid)
    res.render('home' , {user : req.session.userid});
  else
    res.render('login' , {message: req.flash('message')[0]})
});

app.get('/registration', function(req,res){
  res.render('registration' , {message: ''})
});

app.get('/hiking', function(req,res){
  if(req.session.userid)
    res.render('hiking')
  else
    res.redirect('/')
});

app.get('/islands', function(req,res){
  if(req.session.userid)
    res.render('islands')
  else
    res.redirect('/')
});

app.get('/cities', function(req,res){
  if(req.session.userid)
    res.render('cities')
  else
    res.redirect('/')
});

app.get('/bali', function(req,res){
  if(req.session.userid)
    res.render('bali' , {msg: req.flash('msg')[0]})
  else
    res.redirect('/')
});

app.get('/annapurna', function(req,res){
  if(req.session.userid)
    res.render('annapurna' , {msg: req.flash('msg')[0]})
  else
    res.redirect('/')
});

app.get('/inca', function(req,res){
  if(req.session.userid)
    res.render('inca' , {msg: req.flash('msg')[0]})
  else
    res.redirect('/')
});

app.get('/paris', function(req,res){
  if(req.session.userid)
    res.render('paris', {msg: req.flash('msg')[0]})
  else
    res.redirect('/')
});

app.get('/rome', function(req,res){
  if(req.session.userid)
    res.render('rome' , {msg: req.flash('msg')[0]})
  else
    res.redirect('/')
});

app.get('/home', function(req,res){
  if(req.session.userid)
    res.render('home');
  else
    res.redirect('/')
});

app.get('/santorini', function(req,res){
  if(req.session.userid)
    res.render('santorini' , {msg: req.flash('msg')[0]})
  else
    res.redirect('/')
});

app.get('/searchresults', function(req,res){
  if(req.session.userid)
    res.render('searchresults' ,{data : []})
  else
    res.redirect('/')
});



MongoClient.connect("mongodb://0.0.0.0:27017" , (err,client)=>{
  //cheking for errors
  if(err) console.log(err);
  //declaring the collection which we will use
  let collection=client.db('myDB').collection('myCollection');
  
  //handeling login
  app.post('/' , async (req, res)=>{
      let user = req.body.username
      let pass = req.body.password
    //let data = await collection.findOne({username:user , password:pass})
    //if(data===null){
    //  res.render('login' , {message : 'Incorrect username or password'})
    //}
    //else{
    //  req.session.userid=user
    //  res.render('home' , {user : req.session.userid})
    //}
    if(user === 'admin' && pass==='admin'){
      req.session.userid=user
      res.render('home' , {user : req.session.userid})
    }
    else{
      res.render('login' , {message : 'Incorrect username or password'})
    }
  })

  //handling registeration
  app.post('/registration', async (req, res) =>{
    let user = req.body.username
    let pass = req.body.password
    let data = await collection.findOne({username:user})
    if(user==="" || pass===""){
      res.render('registration' , {message : 'Cannot enter empty fields'})
    }
    else
      if(data===null){
        collection.insertOne({username:user , password: pass , wanttogo: []})
        req.flash('message' , 'Successfully registered!')
        res.redirect('/')
        
      }
      else{
        res.render('registration' , {message :`${user} already exists`})
      }
  
  })

  app.post('/wanttogo' , async(req , res)=>{
    listOfWanttogo= [...(await collection.findOne({username: req.session.userid})).wanttogo]
    let found=false
    let item = req.body
    for(let i=0;i<listOfWanttogo.length ; i++){
      if(listOfWanttogo[i].name === item.name){
        found=true
        break
      } 
    }
    if(!found){
      collection.updateOne({username : req.session.userid} , { $push: { "wanttogo" : item  } })
      req.flash('msg' , 'Successfully Added!')
      res.redirect(item.href)
    }
    else{
      req.flash('msg' , 'This destination is already in your want-to-go list!')
      res.redirect(item.href)
    }
  
  })  


  app.get('/wanttogo', async function(req,res){
    if(req.session.userid){
      listOfWanttogo = [...(await collection.findOne({username: req.session.userid})).wanttogo]  
      res.render('wanttogo' , {listOfWanttogo : listOfWanttogo})
    }
    else
      res.redirect('/')
  });

})

//array with all destenations
const all = [{name:'Inca Trail to Machu Picchu', href:'inca'}, 
              {name:'Annapurna Circuit', href:'annapurna'},
              {name:'Paris', href:'paris'},
              {name:'Rome', href:'rome'},
              {name:'Bali Island', href:'bali'},
              {name:'Santorini Island', href:'santorini'}
            ]

//handeling search
app.post('/search' , (req,res)=>{
  let search = req.body.Search
  let data =[]
  all.forEach((item)=>{
    if(item.name.toLowerCase().includes(search.toLowerCase()) && search!=='')
      data.push(item)
  })
  res.render('searchresults', {data:data})
})

app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});



app.listen(3000);
