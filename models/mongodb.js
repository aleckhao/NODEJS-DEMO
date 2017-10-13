var mongoose = require('mongoose');
mongoose.Promise = global.Promise; 
mongoose.connect('mongodb://localhost/nodejs', {useMongoClient: true});
exports.mongoose = mongoose;