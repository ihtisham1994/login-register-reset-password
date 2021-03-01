import { Sequelize, DataTypes } from 'sequelize';
import UserModel from './user';
const config = require('../config/config.json');
const env = process.env.NODE_ENV || 'development';

let sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    config[env]
);
const db: any = {
  sequelize,
  Sequelize,
  User: UserModel(sequelize, DataTypes),
};

db.User.associate(db);
const {
  User,
} = db;

export {
  User,
    db
};