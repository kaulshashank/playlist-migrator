module.exports = function(app) {
    require('./other')(app);
    require('./spotify')(app);
    require('./youtube')(app);
}