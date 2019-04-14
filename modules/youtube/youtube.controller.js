var Youtube = require("youtube-api");

var User = require('../../db/schemas/user.schema.js');

const CREDENTIALS = require('../../config/yt_credentials.js');

var yt_scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube"
];

function getOAuthUrl() {
    let oauth = Youtube.authenticate({
        type: "oauth"
        , client_id: CREDENTIALS.web.client_id
        , client_secret: CREDENTIALS.web.client_secret
        , redirect_url: 'http://localhost:8080/youtube/success'
    });

    var url = oauth.generateAuthUrl({
        access_type: "offline"
        , scope: yt_scopes
    });

    return url;
}

exports.getOAuthUrl = getOAuthUrl;

function handleSuccessOauth(userId, authCode) {
    let oauth = Youtube.authenticate({
        type: "oauth"
        , client_id: CREDENTIALS.web.client_id
        , client_secret: CREDENTIALS.web.client_secret
        , redirect_url: 'http://localhost:8080/youtube/success'
    });
    return new Promise(function (resolve, reject) {
        oauth.getToken(authCode, function (err, tokens) {
            oauth.setCredentials(tokens);
            User.updateOne({ _id: userId }, { 'ytTokens': tokens, 'ytConnected': true }, function (err, raw) {
                if (err) {
                    return reject(err);
                }
                return resolve(raw);
            });
        });
    });
};

exports.handleSuccessOauth = handleSuccessOauth;

function listPlaylists(tokens) {
    return new Promise(function (resolve, reject) {
        let oauth = Youtube.authenticate({
            type: "oauth"
            , client_id: CREDENTIALS.web.client_id
            , client_secret: CREDENTIALS.web.client_secret
            , redirect_url: 'http://localhost:8080/youtube/success'
        });
        oauth.credentials = tokens;
        var params = {
            'maxResults': 25,
            'auth': oauth,
            'mine': 'true',
            'part': 'snippet,contentDetails',
        };
        Youtube.playlists.list(params, function (err, response) {
            if (err) {
                resolve(err);
            } else {
                resolve(response);
            }
        });
    });
}

exports.listPlaylists = listPlaylists;

function createPlaylist(ytTokens, playlistName) {

    return new Promise(function (resolve, reject) {
        let oauth = Youtube.authenticate({
            type: "oauth"
            , client_id: CREDENTIALS.web.client_id
            , client_secret: CREDENTIALS.web.client_secret
            , redirect_url: 'http://localhost:8080/youtube/success'
        });
        oauth.credentials = ytTokens;
        var params = {
            part: 'snippet,status',
            resource: {
                snippet: {
                    title: playlistName,
                    description: 'A playlist migrated by Paylist Migrator.'
                },
                status: {
                    privacyStatus: 'private'
                }
            }
        };
        Youtube.playlists.insert(params, function (err, response) {
            if (err) {
                resolve(err);
            } else {
                resolve(response);
                console.log(response);
            }
        });
    });
}

exports.createPlaylist = createPlaylist;

function insertVideoInPlaylist(ytTokens, playlistId, videoId) {
    setTimeout(function() {}, 1000); // Wait for 1 second; Stupid way to handle google's rate limit.
    return new Promise(function (resolve, reject) {
        let oauth = Youtube.authenticate({
            type: "oauth"
            , client_id: CREDENTIALS.web.client_id
            , client_secret: CREDENTIALS.web.client_secret
            , redirect_url: 'http://localhost:8080/youtube/success'
        });
        oauth.credentials = ytTokens;
        var params = {
            part: "snippet",
            resource: {
                id: playlistId,
                snippet: {
                    playlistId: playlistId,
                    resourceId: {
                        kind: "youtube#video",
                        videoId
                    }
                }
            }
        };
        // console.log('Adding videoId ->', videoId, ' to playlist -> ', playlistId);
        Youtube.playlistItems.insert(params, function (err, response) {
            if (err) {
                console.log('Unable to add videoId ->', videoId, ' to playlist -> ', playlistId);
                console.log('Error -> ', JSON.stringify(err));
                resolve(err);
            } else {
                console.log('Added to add videoId ->', videoId, ' to playlist -> ', playlistId);
                resolve(response);
            }
        });
    })
}

exports.insertVideoInPlaylist = insertVideoInPlaylist;

function searchOnYoutube(ytTokens, arrSearchStrings) {
    var prmSearches = [];
    arrSearchStrings.forEach(function (searchText) {
        prmSearches.push(new Promise(function (resolve, reject) {
            let oauth = Youtube.authenticate({
                type: "oauth"
                , client_id: CREDENTIALS.web.client_id
                , client_secret: CREDENTIALS.web.client_secret
                , redirect_url: 'http://localhost:8080/youtube/success'
            });
            oauth.credentials = ytTokens;
            var params = {
                part: 'snippet',
                q: searchText
            };
            Youtube.search.list(params, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    return resolve({ searchText, response });
                }
            });
        }))
    });

    return Promise.all(prmSearches)
        .then(function (data) {
            return data;
        })
}

exports.searchOnYoutube = searchOnYoutube;