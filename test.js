// test.js
require('./main.js'); // which executes 'mongoose.connect()'

var mongoose = require('mongoose');
console.log(mongoose.connection.readyState);