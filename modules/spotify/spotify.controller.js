var SpotifyWebApi = require('spotify-web-api-node');

var spotify_scopes = ['user-read-private', 'user-read-email'];

var spotifyApi = new SpotifyWebApi({
    clientId: '580b88f9b15d47388b0ee65040f6ddd6',
    clientSecret: '6561c3b2ca134fdda8f2f1fb68563d04',
    scopes: spotify_scopes
});

spotifyApi.clientCredentialsGrant()
    .then(
        function (data) {
            console.log('[SPOTIFY] Authorized.');
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        function (err) {
            console.log('[SPOTIFY] Something went wrong when retrieving an access token.', err);
            return Promise.reject();
        }
    )

function fetchPlaylist(playlistId) {
    return spotifyApi.getPlaylist(playlistId)
        .then(function (data) {
            var songs = [];
            var playlistName = data.body.name;

            data.body.tracks.items.forEach(function (item) {
                var song = {};
                if (item.track.name.length < 20) {
                    song.name = item.track.name;
                } else {
                    song.name = item.track.name.slice(0, 20);
                    song.name = song.name + '...';
                }

                song.artists = item.track.artists.map(artist => artist.name).join(', ');
                song.album = item.track.album.name;
                song.img = item.track.album.images[0].url;
                song.search_text = `${item.track.name} ${song.artists} ${song.album}`;
                songs.push(song);
            });

            return {
                playlistName,
                songs
            }

        }, function (err) {
            console.log('Something went wrong!', err);
        });
}

exports.fetchPlaylist = fetchPlaylist;