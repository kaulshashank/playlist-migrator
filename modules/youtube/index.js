Promise = require('bluebird');
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

    app.post('/youtube/playlists/create', MidWare.authenticate, function (req, res) {
        Controller.createPlaylist(req.user.ytTokens, req.body.playlistName)
            .then(function (playlist) {
                var playlistId = playlist.id;
                return Promise.map(req.body.selections,
                    Controller.insertVideoInPlaylist.bind(null, req.user.ytTokens, playlistId)
                    , { concurrency: 10 });
            })
            .then(function () {
                return {};
            })
            .catch(function (err) {
                console.log(err);
            });
    });

    app.post('/youtube/search', MidWare.authenticate, function (req, res) {
        if (req.user.ytConnected) {
            var data = req.body.searches;
            Controller.searchOnYoutube(req.user.ytTokens, data)
                .then(function (searchResults) {
                    var searchResultHash = new Object();

                    if (searchResults.length) {
                        searchResults.forEach(function (result) {
                            // result -> { searchText, response : {items : [...item]} }

                            var videoItems = result.response.items.map(function (item) {
                                var videoId = item.id.videoId;
                                var videoTitle = item.snippet.title;
                                var videoThumbnail = item.snippet.thumbnails ? item.snippet.thumbnails.default.url : 'https://via.placeholder.com/150x120.png';
                                var videoChannel = item.snippet.channelTitle;

                                return {
                                    videoId,
                                    videoTitle,
                                    videoThumbnail,
                                    videoChannel
                                };
                            });

                            searchResultHash[result.searchText] = videoItems;
                        });
                    }

                    res.send(searchResultHash);
                    return;
                })
        } else {
            res.render('youtube', { ytConnected: false });
            return;
        }
    });
}