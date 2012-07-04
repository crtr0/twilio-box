// Required Modules 

var utils = require('./utils'),
    express = require('express'),
    voicebox = require('./voicebox');

// Configuration 

var app = express();

app.set('view options', {layout: true});
app.use(express.bodyParser());
app.use(express.methodOverride());

// Spin-up the webserver

var server = app.listen(process.env.PORT || 3000);

// Routes   

app.post('/processSMS', function(request, response) {
    if (request.header('X-Twilio-Signature') === utils.twiliosig(request)) {
        response.header('Content-Type', 'text/xml');

        var body = request.param('Body').trim(),
            to = request.param('To'),
            from = request.param('From');

        console.log('Incoming command', to, from, body);

        if (body.indexOf('#search ') >= 0) {
            voicebox.search(body.split('#search ')[1], function (err, res) {
                var msg = '';
                res.forEach(function(song) {
                    msg += song.id + ' ' + song.title + ' ';
                });
                response.send('<Response><Sms>'+utils.smsify(msg)+'</Sms></Response>');
            });
        } 
        else if (body.indexOf('#queue ') >= 0) {
            voicebox.getQueue(body.split('#queue ')[1], function (err, res) {
                var msg = 'Songs queued = ' + res.songs_queued;
                if (res.current_song) msg += ', Current song = ' + res.current_song.title;
                console.log(msg);
                response.send('<Response><Sms>'+utils.smsify(msg)+'</Sms></Response>');
            });
        }
        else if (body.indexOf('#clear ') >= 0) {
            voicebox.clearQueue(body.split('#clear ')[1], function (err, res) {
                response.send('<Response></Response>');
            });
        }
        else if (body.indexOf('#add ') >= 0) {
            var roomId = body.split(' ')[1];
            var songId = body.split(' ')[2];           
            voicebox.addSong(roomId, songId, function (err, res) {
                response.send('<Response></Response>');
            });
        }
        else if (body.indexOf('#bump ') >= 0) {
            var roomId = body.split(' ')[1];
            var songId = body.split(' ')[2];
            voicebox.bump(roomId, songId);
            response.send('<Response></Response>');
        }
        else if (body.indexOf('#delete ') >= 0) {
            var roomId = body.split(' ')[1];
            var ix = body.split(' ')[2];
            voicebox.deleteItem(roomId, ix);
            response.send('<Response></Response>');
        }
        else {
            response.send('<Response></Response>');
        }

    }
    else {
        response.send('Forbidden<');
    }
});

