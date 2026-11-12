const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'bpw7e6v36b4t8mf5je2x-mysql.services.clever-cloud.com',
    user: 'un7hxt0jwwogiyez',
    password: 'X1N60mVsLfNWrOFyB5df', // sua senha
    database: 'bpw7e6v36b4t8mf5je2x',
    port: 3306
});

module.exports = db;