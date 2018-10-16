const Sequelize = require('sequelize');
const sqlite3 = require('sqlite3')
const path = require('path')
const config = require("./config.json")

const sequelize = new Sequelize("main", null, null,  {
  dialect: 'sqlite',
  storage: path.join(__dirname, '/database.db'),
  operatorsAliases: false
});

const NewsList = sequelize.define("news_list", {
  author: Sequelize.TEXT,
  source_name: Sequelize.TEXT,
  source_id: Sequelize.TEXT,
  title: Sequelize.TEXT,
  image_url: Sequelize.TEXT,
  news_url: Sequelize.TEXT,
  created_date: Sequelize.DATEONLY,
  news_type: Sequelize.TEXT
},{
  timestamps: false,
});
module.exports = {
  sequelize,
  NewsList
}
