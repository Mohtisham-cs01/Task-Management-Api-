// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
// const {User , Task} = require("../models/models")

// Database connection details
const database = 'verceldb';
const username = 'default';
const password = 'cVYd4ofp8LvA';
const host = 'ep-little-dust-25650198-pooler.us-east-1.aws.neon.tech';
const port = 5432;

// Create a new Sequelize instance
const sequelize = new Sequelize(database, username, password, {
    host: host,
    port: port,
    dialect: 'postgres',
    define: {
        timestamps: false
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // For self-signed certificates
        }
    }
});

// Models definition
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Task = sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
        ,
        references: {
            model: User, // Referencing the User model
            key: 'id' // Column in the User model to reference
        }
    }
});


Task.belongsTo(User, { foreignKey: 'userId' });




// Sync models with the database
sequelize.sync()
    .then(() => {
        console.log('Models synchronized successfully');
    })
    .catch(err => {
        console.error('Error synchronizing models:', err);
    });

module.exports = { sequelize, User, Task };

