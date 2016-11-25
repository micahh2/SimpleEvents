const expect = require('chai').expect;
const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db_test.sqlite',
});

const Event =  sequelize.import('../event');

describe('event schema', function () { 
  before(function (done) {
    sequelize.sync({ force: true }).then(function () { 
      done(); 
    });
  });

  it('should be able to create events', function (done) {
    let event = Event.build({ title: "An Event" });

    Event.findAll().then(function (data) { 
      expect(data).to.have.length(0);
      event.save();
      Event.findAll().then(function (data) { 
        expect(data).to.have.length(1);
        done();
      });
    });
    
  });
});
