var config = require('../config.js');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var lang = "en";
  
  if(req.cookies.lang){
    lang = req.cookies.lang;
  }
  
  console.log(req.app.get("tl").translations[lang]);
  
  res.render('index', { 
  	title: 'Join or Create Game', 
  	config: config, 
  	strings: req.app.get("tl").translations[lang],
  	translations: req.app.get("tl").transInfo,
  	lang: lang
  });

});

module.exports = router;
