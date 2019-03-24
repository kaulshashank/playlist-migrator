const Controller = require('./youtube.controller.js');
const MidWare = require('../middleware');

module.exports = function (app) {

    app.post('/youtube', MidWare.authenticate, function (req, res) {
        var url = Controller.getOAuthUrl();
        res.redirect(url);
    });

    app.get('/youtube/success', MidWare.authenticate, function (req, res) {
        Controller.handleSuccessOauth(req.user._id, req.query.code)
            .then(function () {
                res.redirect('/');
            });
    });

    app.get('/youtube', MidWare.authenticate, function (req, res) {
        res.render('youtube', { ytConnected: req.user.ytConnected })
    });

    app.post('/youtube/playlists/create', MidWare.authenticate, function(req, res) {
        Controller.createPlaylist(req.users.ytTokens, req.body)
            .then(function(data) {
                res.send(data);
            })
    });

    app.post('/youtube/search', MidWare.authenticate, function(req, res) {
        if (req.user.ytConnected) {
            var data = req.body.searches;
            // Controller.searchOnYoutube(req.user.ytTokens, data)
            //     .then(function(data) {
            //         res.send(data);
            //         return;
            //     })
            res.send();
        } else {
            res.render('youtube', { ytConnected: false });
        }
    });
}