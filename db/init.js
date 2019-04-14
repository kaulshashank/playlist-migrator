var mongoose = require('mongoose');

module.exports = function() {
    console.log("Establishing connection to db...")
    mongoose.connect('mongodb://localhost:27017/yt-migrator', function (err) {
        if (err) {
            console.log('Attempt 1. LOST CONNECTION TO MONGO DB. Trying Again in 4 sec');
            setTimeout(function () {
                mongoose.connect('mongodb://localhost:27017/yt-migrator', function(err) {
                    if(err) {
                        console.log("Could not establish connection on second attempt.")
                    } else {
                        console.log("Database connection established.");
                    }
                });
            }, 4000);
        } else {
            console.log("Database connection established.")
        }        
    });
}