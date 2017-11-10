var wd = wd || {}
wd.video = wd.video || {}

wd.config = {
    authDomain: config.authDomain,
    syncURL: config.syncURL,
    websocketOnly: true
};

wilddog.initializeApp(wd.config);
var ref = wilddog.sync().ref();

var localStream;
var videoInstance;
var participants = [];

var url = decodeURI(location.href);
var roomId = url.split('room=')[1].split('&')[0];
var name = url.split('name=')[1].split('&')[0];
var dimension = url.split('dimension=')[1].split('&')[0];
var uid = '';

var ua = navigator.userAgent;
var isIOS = /iPhone|iPad|iPod/i.test(ua);

wd.video.init = function() {
    $('#copy-btn').attr('data-clipboard-text', location.href);

    wd.video.ui();
    if (roomId == null || roomId == '') {
        location.href = '/product/webrtc-demo/join';
    } else {
        wilddog.auth().signInAnonymously()
            .then(function(user) {
                wilddogVideo.initialize({ appId: config.videoURL, token: user.getToken() });
                wilddogVideo.createLocalStream({
                    captureVideo: true,
                    captureAudio: true,
                    dimension: dimension || '480p',
                    maxFPS: 15
                }).then(function(wdStream) {
                    // console.log(wdStream);
                    localStream = wdStream;
                    videoInstance = wilddogVideo.room(roomId);
                    videoInstance.connect();
                    wd.video.join();
                }).catch(function(err) {
                    $('#failed-tip').show().children('.failed-tip-reason').text('未检测到可用的音视频设备，请检查设备。');
                    console.error(err);
                });
            })
            .catch(function(err) {
                console.error(err);
            });
    }
}


wd.video.join = function() {
    videoInstance.on('connected', function() {
        videoInstance.publish(localStream, function(error) {
            if (error == null) {
                localStream.attach($('video')[0]);
                $('video').eq(0).attr({ 'data-name': name, 'data-streamid': localStream.streamId }).parent('.video-local').show();
            }
            refInit()
        });

        videoInstance.on('stream_added', function(stream) {
            videoInstance.subscribe(stream, function(error) {
                if (error == null) {}
            });
        });

        videoInstance.on('stream_received', function(stream) {
            addStream(stream);
        });

        videoInstance.on('stream_removed', function(stream) {
            removeStream(stream)
            ref.child(roomId).child(stream.streamId).remove() //ref
            displayStreams(participants);
        });
    });
}

wd.video.ui = function() {
    if (Browser) {
       $('.header .info .bower').text(Browser.client.name)
    }

    $('.return-btn').click(function() {
        window.location.href = '/product/webrtc-demo/join';
    })

    $('.leave').click(function(e) {
        if (participants.length == 0) {
            ref.child(roomId).remove();
        }
        videoInstance.disconnect();
        window.location.href = '/product/webrtc-demo/join';
    })

    //剪切板
    var clipboard = new Clipboard('#copy-btn');

    clipboard.on('success', function(e) {
        $('.copy-tip').css({
            'opacity': 1
        });
        setTimeout(function() {
            $('.copy-tip').css({
                'opacity': 0,
                'transition': '0.8s'
            });
        }, 2500)
    });
    clipboard.on('error', function(e) {
        console.log(e);
    });

    window.addEventListener("beforeunload", function(event) {
        videoInstance.disconnect();
        if (participants.length == 0) {
            ref.child(roomId).remove();
        }
    });

    if (!getCookie('wd.webrtcUid')) {
        wilddog.auth().signInAnonymously().then(function(user) {
            setCookie('wd.webrtcUid', user.uid)
        }).catch(function(error) {
            console.log(error);
        });
    } else {
        uid = getCookie('wd.webrtcUid')
    }

    $('.send_btn').click(function() {
        if (!$('.send_input').val() == '') {
            ref.child(roomId).child('chat').push({
                'author': name,
                'uid': uid,
                'message': $('.send_input').val(),
            })
            $('.send_input').val('')
        }
        asideScroll()
    });

    $(window).keydown(function(e) {
        if (e.keyCode == 13) {
            $('.send_input').focus();
            $('.send_btn').click()
        }
    });
    asideScroll()
}

function addStream(participant) {
    participants.push(participant);
    displayStreams(participants);
};

function removeStream(participant) {
    participants.forEach(function(el, i) {
        if (el.constrains.streamId == participant.streamId) {
            participants.splice(i, 1);
            displayStreams(participants);
        }
        if ($('video').eq(i + 1).attr('data-streamId') == participant.streamId) {
            $('video').eq(i + 1).removeAttr('data-streamId').parent('.video-local').hide();
        }
    });
};

function displayStreams(participants) {
    $('.video-local').not($('.video-local').eq(0)).hide()
    for (var i = 0; i < participants.length; i++) {
        participants[i].attach($('video')[i + 1])
        $('video').eq(i + 1).attr('data-streamId', participants[i].streamId).parent('.video-local').show();
    }
}

function asideScroll() {
    $('.chat').scrollTop($('.chat').children().length * 78 + $('.chat').height());
}

function refInit() {
    ref.child(roomId).child(localStream.streamId).update({
        'name': name,
        'streamId': localStream.streamId,
        'board': true,
        'captureAudio': true
    });

    ref.child(roomId).child('chat').on('value', function(snapshot) {
        var html = ''
        $('.chat').empty()
        if (snapshot.val()) {
            Object.keys(snapshot.val()).map(function(el, i) {
                if (snapshot.val()[el]['uid'] == uid) {
                    html += '<div class="chat_right clearfix"><span class="name">' + snapshot.val()[el]['author'] + '</span><span class="text">' + snapshot.val()[el]['message'] + '</span></div>'
                } else {
                    html += '<div class="chat_left clearfix"><span class="name">' + snapshot.val()[el]['author'] + '</span><span class="text">' + snapshot.val()[el]['message'] + '</span></div>'
                }
            })
        }
        $('.chat').append(html);
        asideScroll()
    });
}

function setCookie(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
