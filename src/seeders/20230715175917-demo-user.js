"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Users", [
      {
        username: "John Doe",
        email: "john.doe@example.com",
        password: await bcrypt.hash("password", 10),
        phone: "1234567890",
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "Jane Doe",
        email: "jane.doe@example.com",
        password: await bcrypt.hash("password", 10),
        phone: "0987654321",
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
