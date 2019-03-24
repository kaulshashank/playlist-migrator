var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
const uuid = require('uuid/v4');

require('./db/init.js')();
require('./config/passport.js')(passport);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(session({
    secret: 'kthnxbai',
    resave: false,
    saveUninitialized: true,
    genid: (req) => {
        return uuid() // use UUIDs for session IDs
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('views', './views');
app.set('view engine', 'ejs');

require('./modules/index')(app);

app.listen(8080, function () {
    console.log("Listening on port 8080.")
})