module.exports = function(db, passport) {
    var express         = require('express');
    var router          = express.Router();
    var db              = require('../db');
    var bodyParser      = require('body-parser');
    var nodemailer      = require('nodemailer');
    var hoursSchema     = require('../models/hours.js');
    var menuSchema      = require('../models/menu.js');
    var eventsSchema    = require('../models/events.js');
    var specialsSchema  = require('../models/specials.js');
    var flash           = require('connect-flash');
    var https           = require('https');
    var Dropbox         = require('dropbox');
    var validator       = require('validator');
    var path            = require('path');

    router.post('/insta', function(req, response, next) {

      const https = require('https');

      https.get('https://api.instagram.com/v1/users/self/media/recent/?access_token=' + process.env.igaccess, (res) => {

        res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk) => rawData += chunk);
          res.on('end', () => {
            try {
              let parsedData = JSON.parse(rawData);
              response.send(parsedData);
            } catch (e) {
              console.log(e.message);
            }
          });
      }).on('error', (e) => {
        console.error(e);
      });
    });

    var LocalStrategy = require('passport-local').Strategy;
    var register = require('../passport/config.js')(passport);
    router.post('/register', function(req, res, next) {
        passport.authenticate('register', function(err, newUser, info) {
          if (err) return next(err);
          if (!newUser) return res.send({success: false});
        })(req,res,next);
    });

    router.post('/login', function(req, res, next) {
      passport.authenticate('login', function(err, user, info) {
        if (err) return next(err);
        if (!user) return res.send({success: false});
        return res.send({success: true})
      })(req, res, next);
    });

    var isLoggedIn = function(req, res, next) {
      if (req.isAuthenticated()) return next();
      res.redirect("/");
    }

    router.get('/getEvents', function(req, res) {
      eventsSchema.find({}, {}, {sort: {"start": -1}}, function(err, events) {
            if (events) {
              res.send(events);
            } else {
              res.end();
            }
        });
    });

    router.post('/addEvent', function(req, res, next) {
      var event = new eventsSchema({
          title: req.body.title,
          start: req.body.start,
          end: req.body.end,
          description: req.body.desc,
          allDay: false,
          url: req.body.url
      });
      event.save(function(err, ev) {
        if (err) return res.send({success: false, err: err});
        else return res.send({success: true});
      });
      console.log(req.body);
    });

    router.post('/deleteEvent', function(req, res, next) {
      eventsSchema.find({_id: req.body.id}).remove(function(err, data) {
        if (err) {console.log(err); return res.send({success: false, err: err});}
        else return res.send({success: true});
      });
    });

    // /* GET logout page */
    // router.get('/logout', function(req, res, next) {
    //   req.logout();
    //   res.redirect('/');
    // });

    return router;
}
