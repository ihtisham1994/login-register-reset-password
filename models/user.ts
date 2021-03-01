'use strict';

import { Model } from 'sequelize';

export default(sequelize: any, DataTypes:any) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models:any) {
      // define association here
    }
  };
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    dob: DataTypes.DATE,
    resetLink: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};