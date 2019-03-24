var mongoose = require('mongoose');

module.exports = function() {
    console.log("Establishing connection to db...")
    mongoose.connect('mongodb://localhost:27017/yt-migrator', { useNewUrlParser: true }, function (err) {
        if (err) {
            console.log('Attempt 1. LOST CONNECTION TO MONGO DB. Trying Again in 4 sec');
            setTimeout(function () {
                mongoose.connect('mongodb://localhost:27017/yt-migrator');
            }, 4000);
        }
        console.log("Database connection established.")
    });
}