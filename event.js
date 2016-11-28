// id,   event   title,  start   date,
// end date,   category,   description,
// featured    flag,   created at
// timestamp,    updated at  timestamp

// I should have added some default values / validation
module.exports =
  (sequelize, DataTypes) => sequelize.define('event', {
    title: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    category: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    },
    featured: {
      type: DataTypes.BOOLEAN,
    },
  });
