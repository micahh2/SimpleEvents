const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');


// App
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
router.get('/list', function (req, res) {
    Event.findAll().then(function (data) {
      res.json(data);
    });
});
router.post('/update', function(req, res) {
  Event.update(req.body, { where: { id: req.body.id, }, });
  res.status(200).end();
});
router.post('/delete', function(req, res) {
  Event.destroy({ where: { id: req.body.id, }, });
  res.status(200).end();
});
router.post('/add', function(req, res) {
  var ev = Event.build(Object.assign({}, req.body));
  ev.save().then(() => res.json(ev).end());
});
router.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
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
