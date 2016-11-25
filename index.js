const express = require('express');
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');


// App
const app = express();
const runApp = function () {
  app.listen(8080, function () {
      console.log('App Listing On 8080');
  });
};

// Schema
const dbpath = 'db.sqlite';
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbpath,
});
const Event = sequelize.import('./event');

// Routes
// home, list, update, add, delete
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});
router.get('/list', function (req, res) {
    Event.findAll().then(function (data) {
      res.json(data);
    });
});
app.use('/bin', express.static('bin'));
app.use('/', router);

//Start
try {
  let dbFile = fs.statSync(dbpath);
  runApp();
} 
catch (e) { 
  if (e.code != 'ENOENT') throw e;
  sequelize.sync({ force: true }).then(function () { 
    Event.build({ title:"New" }).save();
    Event.build({ title:"New 2" }).save();
    runApp();
  })
}

module.exports = app;
