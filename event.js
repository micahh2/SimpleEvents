// id,   event   title,  start   date,
// end date,   category,   description,
// featured    flag,   created at
// timestamp,    updated at  timestamp

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('event', {
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
    createdDate: {
      type: DataTypes.DATE,
    },
    updatedDate: {
      type: DataTypes.DATE,
    },
  });
};
