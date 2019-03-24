const Controller = require('./spotify.controller.js');
const MidWare = require('../middleware');

module.exports = function (app) {
    app.get('/spotify/playlist', MidWare.authenticate, function (req, res) {
        var arr_spotify_uri = req.query.spotify_playlist_uri.split(':');
        var playlistId = arr_spotify_uri[arr_spotify_uri.length - 1];

        Controller.fetchPlaylist(playlistId)
            .then(function (playlist) {
                playlist.step = 2;
                return res.render('converter', playlist);
            });
    });
}