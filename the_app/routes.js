const crypto = require("crypto");
const gen = require("./generator.js");

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};


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
    db.collection('campaigns').find({email:auth}).toArray((err, result) => {
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
    
    
    db.collection('campaigns').find({guid:req.params.guid,email:auth}).toArray((err, result) => {
      if(result[0]){
        var name = result[0].name;
        var emails = result[0].email;
      }else{
        var name = "undef";
        var emails = [];
      }
      
      
      db.collection('ships').find({campaign:req.params.guid,email:auth}).toArray((err, result) => {
        var ships =result;
        db.collection('stars').find({campaign:req.params.guid}).toArray((err, stars) => {
          var star_guids = stars.map(function(a) {return a.guid;});
          db.collection('planets').find({"star": {$in: star_guids}}).toArray((err, planets) => {
            db.collection('star_msg').find({"star": {$in: star_guids}}).toArray((err, star_msg) => {
              var planet_guids = planets.map(function(a) {return a.guid;});
              db.collection('planet_msg').find({"planet": {$in: planet_guids}}).toArray((err, planet_msg) => {
                if (err) return console.log(err)
                res.render('campaign.ejs', {stars: stars, 
                                            ships:ships, 
                                            planets:planets, 
                                            star_msg:star_msg, 
                                            planet_msg:planet_msg, 
                                            auth:auth, 
                                            campaign:req.params.guid,
                                            c_name:name,
                                            emails:emails
                                          })
              })
            })
          })
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


  app.get('/campaign-:guid/ship-:suid', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = checkAuth(req,res,next,db, function (a, user) {
      console.log("inside,a:"+a+ " user:"+user);

      auth = a;
    });


      db.collection('ships').find({guid:req.params.suid}).toArray((err, ships) => {
        var this_ship= ships[0];
        var emails = ships[0].email;
        db.collection('ships_items').find({ship:req.params.suid}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('ship.ejs', {ships_items: result, 
                                  auth:auth, 
                                  campaign:req.params.guid,
                                  this_ship:this_ship,
                                  emails:emails})
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

  app.get('/campaign-:guid/ship-:suid/item-:puid', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = checkAuth(req,res,next,db, function (a, user) {
      console.log("inside,a:"+a+ " user:"+user);

      auth = a;
    });

      db.collection('ships_items').find({guid:req.params.puid}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('item.ejs', {this_item: result[0], 
                                auth:auth, 
                                campaign:req.params.guid,
                                star:req.params.suid})
      })
  })

  app.get('/planet-:puid', (req, res, next) => {

    db.collection('planets').find({guid:req.params.puid}).toArray((err, p) => {
      // console.log(p);
      db.collection('stars').find({guid:p[0].star}).toArray((err, s) => {
      // console.log(s);

        res.redirect('/campaign-'+s[0].campaign+'/star-'+p[0].star+'/planet-'+req.params.puid)

      })
    })
  })
  app.get('/item-:puid', (req, res, next) => {

    db.collection('ships_items').find({guid:req.params.puid}).toArray((err, p) => {
      db.collection('ships').find({guid:p[0].ship}).toArray((err, s) => {
        res.redirect('/campaign-'+s[0].campaign+'/ship-'+p[0].ship+'/item-'+req.params.puid)

      })
    })
  })

  app.get('/star-:suid', (req, res, next) => {

      db.collection('stars').find({guid:req.params.suid}).toArray((err, s) => {
        res.redirect('/campaign-'+s[0].campaign+'/star-'+req.params.suid)

      })


  })
  app.get('/ship-:suid', (req, res, next) => {

      db.collection('ships').find({guid:req.params.suid}).toArray((err, s) => {
        res.redirect('/campaign-'+s[0].campaign+'/ship-'+req.params.suid)

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
    var temp = req.body.email;
    req.body.email = [];
    req.body.email.push(temp);
    db.collection('campaigns').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/campaign-'+req.body.guid)
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

  app.post('/campaign-:guid/ship', (req, res) => {
    const id = crypto.randomBytes(16).toString("hex");
    req.body.guid = id.substring(0,7);
    var temp = req.body.email;
    req.body.email = [];
    req.body.email.push(temp);
    db.collection('ships').save(req.body, (err, result) => {
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

  app.post('/campaign-:guid/ship-:suid/item', (req, res) => {
    const id = crypto.randomBytes(16).toString("hex");
    req.body.guid = id.substring(0,7);
    db.collection('ships_items').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/campaign-'+req.params.guid+'/ship-'+req.params.suid)
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

  app.post('/update_ship-:suid', (req, res) => {
    db.collection('ships')
    .findOneAndUpdate({guid: req.params.suid}, {
      $set: {
        name: req.body.name,
        text: req.body.text,
        campaign: req.body.campaign,
        guid: req.params.suid
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/ship-'+req.params.suid)
    })
  })

  app.post('/update_item-:puid', (req, res) => {
    db.collection('ships_items')
    .findOneAndUpdate({guid: req.params.puid}, {
      $set: {
        name: req.body.name,
        text: req.body.text,
        health: req.body.health,
        armor: req.body.armor,
        repaircost: req.body.repaircost,
        damage: req.body.damage,
        ap: req.body.ap,
        range: req.body.range,
        maxcharge: req.body.maxcharge,
        euh: req.body.euh,
        acc: req.body.acc,
        speed: req.body.speed,
        xport: req.body.xport,
        iport: req.body.iport,
        cost: req.body.cost,
        ship: req.body.ship,
        guid: req.params.puid
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/item-'+req.params.puid)
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












  app.post('/add_email_campaign-:guid', (req, res) => {
    console.log("email to add:"+req.body.email);
    db.collection('campaigns')
    .updateOne({guid: req.params.guid}, {
      $push: {
        email: req.body.email
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/campaign-'+req.params.guid)
    })
  })



  app.post('/add_email_ship-:guid', (req, res) => {
    console.log("email to add:"+req.body.email);
    db.collection('ships')
    .updateOne({guid: req.params.guid}, {
      $push: {
        email: req.body.email
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/ship-'+req.params.guid)
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
  // app.delete('/hoa', (req, res) => {
  //   db.collection('hoa').findOneAndDelete({guid: req.body.guid}, (err, result) => {
  //     if (err) return res.send(500, err)
  //     res.send('A darth vadar quote got deleted')
  //   })
  // })

  app.get('/delete_planet_msg-:muid/:puid', (req, res) => {
    // console.log(req.params);
    db.collection('planet_msg').findOneAndDelete({guid: req.params.muid}, (err, result) => {
      // console.log(result);
      // console.log(req.params);
      if (err) return res.send(500, err)
      res.redirect('/planet-'+req.params.puid)
    })
  })


  app.get('/delete_planet-:puid/:suid', (req, res) => {
    // console.log(req.params);
    db.collection('planet_msg').deleteMany({planet: req.params.puid}, (err, result) => {
      // console.log(result);
      // console.log(req.params);
      if (err) return res.send(500, err)
      // res.redirect('/planet-'+req.params.puid)
    })
    db.collection('planets').findOneAndDelete({guid: req.params.puid}, (err, result) => {
      // console.log(result);
      // console.log(req.params);
      if (err) return res.send(500, err)
      res.redirect('/star-'+req.params.suid)
    })
  })

  app.get('/delete_star_msg-:muid/:suid', (req, res) => {
    // console.log(req.params);
    db.collection('star_msg').findOneAndDelete({guid: req.params.muid}, (err, result) => {
      // console.log(result);
      // console.log(req.params);
      if (err) return res.send(500, err)
      res.redirect('/star-'+req.params.suid)
    })
  })

  app.get('/delete_star-:suid/:cuid', (req, res) => {
    // console.log(req.params);
    db.collection('planets').find({star:req.params.suid}).toArray((err, p) => {
      // console.log(p);
      for (var i = 0; i < p.length; i++) {
        db.collection('planet_msg').deleteMany({planet: p[i].guid}, (err, result) => {
          if (err) return res.send(500, err)
        })
     } 
    })
    
    db.collection('planets').deleteMany({star: req.params.suid}, (err, result) => {
      // console.log(result);
      // console.log(req.params);
      if (err) return res.send(500, err)
      // res.redirect('/campaign-'+req.params.cuid)
    })

    db.collection('star_msg').deleteMany({star: req.params.suid}, (err, result) => {
      // console.log(result);
      // console.log(req.params);
      if (err) return res.send(500, err)
      // res.redirect('/star-'+req.params.suid)
    })
    
    db.collection('stars').findOneAndDelete({guid: req.params.suid}, (err, result) => {
      // console.log(result);
      // console.log(req.params);
      if (err) return res.send(500, err)
      res.redirect('/campaign-'+req.params.cuid)
    })
  })

  app.get('/delete_campaign-:cuid', (req, res) => {
    db.collection('ships').find({campaign:req.params.cuid}).toArray((err, h) => {
      // console.log(p);
      for (var i = 0; i < h.length; i++) {
        db.collection('ships_items').deleteMany({ship: h[i].guid}, (err, result) => {
          if (err) return res.send(500, err)
        })
      } 
    })
    db.collection('ships').deleteMany({campaign: req.params.cuid}, (err, result) => {
      if (err) return res.send(500, err)
    })
    db.collection('stars').find({campaign:req.params.cuid}).toArray((err, s) => {
      for(var i = 0; i < s.length; i++){
        db.collection('star_msg').deleteMany({star: s[i].guid}, (err, result) => {
          if (err) return res.send(500, err)
        })
        db.collection('planets').find({star:s[i].guid}).toArray((err, p) => {
          // console.log(p);
          for (var j = 0; j < p.length; j++) {
            db.collection('planet_msg').deleteMany({planet: p[j].guid}, (err, result) => {
              if (err) return res.send(500, err)
            })
          } 
        })
        db.collection('planets').deleteMany({star: s[i].guid}, (err, result) => {
          if (err) return res.send(500, err)
        })
      }
    })
  
    db.collection('stars').deleteMany({campaign: req.params.cuid}, (err, result) => {
      if (err) return res.send(500, err)
    })
    db.collection('campaigns').deleteMany({guid: req.params.cuid}, (err, result) => {
      if (err) return res.send(500, err)
      res.redirect('/')
    })
  })




  app.get('/logout', function(req, res){
    console.log('logging out');
      console.log("oauth-"+req.session.oauth2return);
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
  app.get('/auth/google-:guid',
    (req, res, next) => {
      console.log("oauth-"+req.session.oauth2return);
      req.session.oauth2return = req.params.guid;
      next();
    },
    passport.authenticate('google', { scope: ['email', 'profile'] })
  );
  // app.get('/auth/google/callback', passport.authenticate('google', { 
  //           failureRedirect: '/',
  //           successRedirect : '/protected' })
  // );
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res, next) {
      console.log(req.session.oauth2return);
      if(req.session.oauth2return){
        res.redirect('/ensure-'+req.session.oauth2return);
      }else{
        res.redirect('/protected');
      }
      // console.log(req.session.oauth2return);
    }
  );


  app.get('/protected', ensureAuthenticated, function(req, res) {
    res.redirect('/')
  });

  app.get('/ensure-:guid', ensureAuthenticated, function(req, res) {

    console.log(req.params.guid);

    var ret_val;
    if(req.user.email){
      ret_val = req.user.email;
    }else if(req.user.emails[0].value){
      ret_val = req.user.emails[0].value;
    }else{
      console.log("Auth failed:"+req.user);
      res.redirect('/campaign-:'+req.params.guid)
    }

    db.collection('campaign')
    .updateOne({guid: req.params.guid}, {
      $push: {
        email: ret_val
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
    })
    db.collection('ships')
    .updateOne({campaign: req.params.guid}, {
      $push: {
        email: ret_val
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
    })
      res.redirect('/campaign-'+req.params.guid)
      
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
  //   db.collection('user').find().toArray((err, result) => {
  //       if (err) return console.log(err)
  //       // console.log(req.user);
  //       for (var i = 0, ilen = result.length; i < ilen; i++) {
  //         for (var j = 0, jlen = req.user.emails.length; j < jlen; j++) {
  //           db_user = result[i].user;
  //           req_user = req.user.emails[j].value;
  //           console.log("Found users: "+db_user+", and: "+req_user);
  //           if(db_user==req_user){
  //             auth=true;
  //             console.log("Success! Found users: "+db_user+", and: "+req_user);
  //             console.log("checkAuth:"+auth);
  //             // return callback(auth);
  //           }
  //         }
  //       }
  //       return callback(auth);
        
  //     });
    // console.log(req.user);
    var ret_val;
    if(req.user.email){
      ret_val = req.user.email;
    }else if(req.user.emails[0].value){
      ret_val = req.user.emails[0].value;
    }else{
      console.log("Auth failed:"+req.user);
      ret_val = fail; 
    }
    return ret_val;
  }
  
}
