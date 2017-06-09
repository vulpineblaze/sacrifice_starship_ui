const crypto = require("crypto");
const gen = require("./generator.js");

module.exports = function(app, passport, db) {


  app.get('/', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = checkAuth(req,res,next,db, function (a, user) {
      console.log("inside,a:"+a+ " user:"+user);

      auth = a;
    });
    
    console.log("auth:"+auth);
   

    var the_date = new Date().toISOString().replace(/T.+/, ' ').replace(/\..+/, '');
    // console.log("the_date:"+the_date);
    db.collection('campaigns').find().toArray((err, result) => {
      if (err) return console.log(err)
      // console.log(result.length);
      res.render('index.ejs', {campaigns: result, auth:auth})
    })
  })

  // app.get('/latest', (req, res, next) => {
  //   var the_date = new Date().toISOString().replace(/T.+/, ' ').replace(/\..+/, '');
  //   db.collection('hoa').find({"title" : {"$lte": the_date}}).sort({title: 1}).toArray((err, result) => {
  //     if (err) return console.log(err)
  //     res.redirect("/#"+result[result.length-1].title)
  //   })
  // })


  app.get('/campaign-:guid', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = checkAuth(req,res,next,db, function (a, user) {
      console.log("inside,a:"+a+ " user:"+user);

      auth = a;
    });
    db.collection('campaigns').find({guid:req.params.guid}).toArray((err, result) => {
      var name = result[0].name;
      db.collection('stars').find({campaign:req.params.guid}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('campaign.ejs', {stars: result, 
                                    auth:auth, 
                                    campaign:req.params.guid,
                                    c_name:name
                                  })
      })
    })
  })


  app.get('/campaign-:guid/star-:suid', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = checkAuth(req,res,next,db, function (a, user) {
      console.log("inside,a:"+a+ " user:"+user);

      auth = a;
    });

    db.collection('star_msg').find({star:req.params.suid}).toArray((err, msgs) => {

      db.collection('stars').find({guid:req.params.suid}).toArray((err, stars) => {
        var this_star = stars[0];
        db.collection('planets').find({star:req.params.suid}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('star.ejs', {planets: result, 
                                  auth:auth, 
                                  msgs:msgs, 
                                  campaign:req.params.guid,
                                  this_star:this_star})
        })
      })
    })
  })

  app.get('/campaign-:guid/star-:suid/planet-:puid', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = checkAuth(req,res,next,db, function (a, user) {
      console.log("inside,a:"+a+ " user:"+user);

      auth = a;
    });

    db.collection('planet_msg').find({planet:req.params.puid}).toArray((err, msgs) => {
      db.collection('planets').find({guid:req.params.puid}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('planet.ejs', {this_planet: result[0], 
                                auth:auth, 
                                msgs:msgs, 
                                campaign:req.params.guid,
                                star:req.params.suid})
      })
    })
  })

  app.get('/planet-:puid', (req, res, next) => {

    db.collection('planets').find({guid:req.params.puid}).toArray((err, p) => {
      db.collection('stars').find({guid:p[0].star}).toArray((err, s) => {
        res.redirect('/campaign-'+s[0].campaign+'/star-'+p[0].star+'/planet-'+req.params.puid)

      })
    })
  })

  app.get('/star-:suid', (req, res, next) => {

      db.collection('stars').find({guid:req.params.suid}).toArray((err, s) => {
        res.redirect('/campaign-'+s[0].campaign+'/star-'+req.params.suid)

      })


  })


  app.get('/star_msg-:suid', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = checkAuth(req,res,next,db, function (a, user) {
      console.log("inside,a:"+a+ " user:"+user);

      auth = a;
    });

    db.collection('star_msg').find({guid:req.params.suid}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('star_msg.ejs', {msg: result[0], auth:auth})
    })
  })



  app.get('/planet_msg-:puid', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = checkAuth(req,res,next,db, function (a, user) {
      console.log("inside,a:"+a+ " user:"+user);

      auth = a;
    });

    db.collection('planet_msg').find({guid:req.params.puid}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('planet_msg.ejs', {msg: result[0], auth:auth})
    })
  })



  app.get('/generate', (req, res, next) => {
    var result = gen.gen(function (a) {
      result = a;
    });
    res.render('generate.ejs', {result: result})
  })

  app.post('/campaigns', (req, res) => {
    const id = crypto.randomBytes(16).toString("hex");
    req.body.guid = id.substring(0,7);
    db.collection('campaigns').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
    })
  })

  app.post('/campaign-:guid/star', (req, res) => {
    const id = crypto.randomBytes(16).toString("hex");
    req.body.guid = id.substring(0,7);
    db.collection('stars').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/campaign-'+req.params.guid)
    })
  })

  app.post('/campaign-:guid/star-:suid/planet', (req, res) => {
    const id = crypto.randomBytes(16).toString("hex");
    req.body.guid = id.substring(0,7);
    db.collection('planets').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/campaign-'+req.params.guid+'/star-'+req.params.suid)
    })
  })

  app.post('/campaign-:guid/star-:suid/msg', (req, res) => {
    const id = crypto.randomBytes(16).toString("hex");
    req.body.guid = id.substring(0,7);
    db.collection('star_msg').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/campaign-'+req.params.guid+'/star-'+req.params.suid)
    })
  })

  app.post('/campaign-:guid/planet-:puid/msg', (req, res) => {
    const id = crypto.randomBytes(16).toString("hex");
    req.body.guid = id.substring(0,7);
    db.collection('planet_msg').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/planet-'+req.params.puid)
    })
  })

  app.post('/update_campaign-:guid', (req, res) => {
    db.collection('campaigns')
    .findOneAndUpdate({guid: req.params.guid}, {
      $set: {
        name: req.body.name,
        guid: req.params.guid
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/campaign-'+req.params.guid)
    })
  })


  app.post('/update_star-:suid', (req, res) => {
    db.collection('stars')
    .findOneAndUpdate({guid: req.params.suid}, {
      $set: {
        name: req.body.name,
        region: req.body.region,
        x: req.body.x,
        y: req.body.y,
        campaign: req.body.campaign,
        text: req.body.text,
        guid: req.params.suid
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/campaign-'+req.body.campaign+'/star-'+req.params.suid)
    })
  })


  app.post('/update_planet-:puid', (req, res) => {
    db.collection('planets')
    .findOneAndUpdate({guid: req.params.puid}, {
      $set: {
        name: req.body.name,
        star: req.body.star,
        text: req.body.text,
        guid: req.params.puid
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/planet-'+req.params.puid)
    })
  })

  app.post('/star_msg-:suid', (req, res) => {
    db.collection('star_msg')
    .findOneAndUpdate({guid: req.params.suid}, {
      $set: {
        visible: req.body.visible,
        star: req.body.star,
        text: req.body.text,
        guid: req.params.suid
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/star-'+req.body.star)
    })
  })

  app.post('/planet_msg-:puid', (req, res) => {
    db.collection('planet_msg')
    .findOneAndUpdate({guid: req.params.puid}, {
      $set: {
        visible: req.body.visible,
        planet: req.body.planet,
        text: req.body.text,
        guid: req.params.puid
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/planet-'+req.body.planet)
    })
  })




  // app.put('/hoa', (req, res) => {
  //   db.collection('hoa')
  //   .findOneAndUpdate({name: 'Yoda'}, {
  //     $set: {
  //       name: req.body.name,
  //       quote: req.body.quote
  //     }
  //   }, {
  //     sort: {_id: -1},
  //     upsert: true
  //   }, (err, result) => {
  //     if (err) return res.send(err)
  //     res.send(result)
  //   })
  // })

  // app.delete('/hoa', (req, res) => {
  //   db.collection('hoa').findOneAndDelete({guid: req.body.guid}, (err, result) => {
  //     if (err) return res.send(500, err)
  //     res.send('A darth vadar quote got deleted')
  //   })
  // })

  app.get('/delete-:guid', (req, res) => {
    db.collection('hoa').findOneAndDelete({guid: req.params.guid}, (err, result) => {
      if (err) return res.send(500, err)
      res.redirect('/')
    })
  })


  app.get('/logout', function(req, res){
    console.log('logging out');
    req.logout();
    res.redirect('/');
  })

  // we will call this to start the GitHub Login process
  app.get('/auth/github', passport.authenticate('github'));

  // app.get('/auth/github', function(req, res, next){
  //     req.passport.authenticate('github')(req, res, next);
  // });

  // GitHub will call this URL
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res, next) {
      res.redirect('/protected');
    }
  );



  app.get('/auth/google', passport.authenticate('google',{ scope : ['profile', 'email'] }));
  // app.get('/auth/google', passport.authenticate('google',{scope: 'https://www.googleapis.com/auth/plus.me https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'}));

  app.get('/auth/google/callback', passport.authenticate('google', { 
            failureRedirect: '/',
            successRedirect : '/protected' })
  );



  app.get('/protected', ensureAuthenticated, function(req, res) {
    res.redirect('/')
  });


};



// Simple middleware to ensure user is authenticated.
// Use this middleware on any resource that needs to be protected.
// If the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next(); }

  // denied. redirect to login
  res.redirect('/')
}

function checkAuth(req, res, next, db, callback){
  var auth = false;
  if (req.isAuthenticated()) {
    db.collection('user').find().toArray((err, result) => {
        if (err) return console.log(err)
        // console.log(req.user);
        for (var i = 0, ilen = result.length; i < ilen; i++) {
          for (var j = 0, jlen = req.user.emails.length; j < jlen; j++) {
            db_user = result[i].user;
            req_user = req.user.emails[j].value;
            console.log("Found users: "+db_user+", and: "+req_user);
            if(db_user==req_user){
              auth=true;
              console.log("Success! Found users: "+db_user+", and: "+req_user);
              console.log("checkAuth:"+auth);
              // return callback(auth);
            }
          }
        }
        return callback(auth);
        
      });
  }
  
}