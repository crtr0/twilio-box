// Inspired by the good work of this fellow: https://github.com/substack/node-voicebox

var request = require('request');

exports.search = function (search, cb) {
    var opts = {
        uri : 'http://voiceboxpdx.com/api/v1/songs/search.json?query='
            + search.replace(/\s+/g, '+')
        ,
        json : true
    };
    request(opts, function (err, res, body) {
        if (err) cb(err)
        else cb(null, body.songs)
    });
};

exports.getQueue = function (roomId, cb) {
    var opts = {
        uri : 'http://voiceboxpdx.com/api/v1/queue.json?room_code='
            + roomId,
        json : true,
    };
    return request.get(opts, function (err, res, body) {
        if (err) cb(err)
        else cb(null, body)
    });
};

exports.clearQueue = function (roomId, cb) {
    var opts = {
        method : 'DELETE',
        uri : 'http://voiceboxpdx.com/api/v1/queue.json?room_code='
            + roomId,
    };
    return request(opts, cb);
};

exports.addSong = function (roomId, songId, cb) {
    return request.post('http://voiceboxpdx.com/api/v1/queue.json?'
        + 'room_code=' + roomId + '&song_id=' + songId, cb);
};

exports.bump = function (roomId, songId) {
    var self = this;
    self.getQueue(roomId, function (err, res) {
        if (err) console.error(err);
        self.clearQueue(roomId, function (err) {
            self.addSong(roomId, songId, function (err) {
                res.queue.forEach(function (q) {
                    self.addSong(roomId, q.song_id);
                });
            });
        });
    });
};

exports.deleteItem = function deleteItem (roomId, ix, cb) {
    var self = this;
    self.getQueue(roomId, function (err, res) {
        self.clearQueue(roomId, function (err) {
            if (err) return cb(err);
            res.queue.forEach(function (q) {
                if (q.index === ix) return;
                self.addSong(roomId, q.song_id);
            });
        });
    });
};
