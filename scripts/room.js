/*
* @Author: ihoey
* @Date:   2017-11-09 17:14:50
* @Last Modified by:   ihoey
* @Last Modified time: 2017-11-09 17:18:46
*/
var wd = wd || {}
wd.video = wd.video || {}

var config = {
    authDomain: "wildrtc.wilddog.com",
    syncURL: "https://wildrtc.wilddogio.com"
};

wilddog.initializeApp(config);
var ref = wilddog.sync().ref();

var localStream;
var videoInstance;
var participants = [];
var barrageFlag = true;
var url = decodeURI(location.href);
var roomId = url.split('room=')[1].split('&')[0];
var dimension = url.split('dimension=')[1].split('&')[0];
var roomFull = false;
var ua = navigator.userAgent;
var isIOS = /iPhone|iPad|iPod/i.test(ua);


wd.video.init = function() {
    $('#currentURL')[0].value = location.href;
    if (roomId == null || roomId == '') {
        location.href = '/product/webrtc-demo/join';
    } else {
        wilddog.auth().signInAnonymously()
            .then(function(user) {
                wilddogVideo.initialize({ appId: 'wildrtc', token: user.getToken() });
                wilddogVideo.createLocalStream({
                    captureVideo: true,
                    captureAudio: true,
                    dimension: dimension ||'480p',
                    maxFPS: 15
                }).then(function(wdStream) {
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
    wd.video.ui();
}

wd.video.join = function() {
    videoInstance.on('connected', function() {
        videoInstance.publish(localStream, function(error) {
            if (error == null) {
                localStream.attach($('#localStream')[0]);
            }
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
        });

    });


}

wd.video.ui = function() {

    $('.media').on('click', function() {
        var muted = $(this).children('i').attr('data-muted')
        var video = $(this).parent().siblings('video')[0]
        $(this).children('i').toggleClass('active');
        if (muted == 'true') {
            video.muted = false;
            $(this).children('i').attr('data-muted', false)
        } else {
            video.muted = true;
            $(this).children('i').attr('data-muted', true)
        }
    })

    $('.fullscreen').on('click', function() {
        var video = $(this).parent().siblings('video')[0]
        launchFullscreen(video);
    })

    $('.close').on('click', function() {
        $(this).parent().siblings('.mask').toggle();
        $(this).children('i').toggleClass('active');
    })

    $('.barragectl').on('click', function() {
        if (barrageFlag) {
            wd.video.barrage();
            barrageFlag = false
        }
        $('.d_show').toggle();
        $('.barswitch').toggle();
        $(this).children('i').toggleClass('active');
    })

    $('#return-btn').click(function() {
        window.location.href = '/product/webrtc-demo/join';
    })

    $('.login').click(function(e) {
        e.preventDefault()
        if (participants.length == 0) {
            ref.remove();
            $('.d_show').empty();
        }
        videoInstance.disconnect();
        window.location.href = '/product/webrtc-demo/join';
    })


    if (!isIOS) {
        $('.video').on('mouseover', function() {
            $(this).children('.controls').show()
        })
        $('.video').on('mouseout', function() {
            $(this).children('.controls').show().hide()
        })
    } else {
        $('.video').attr('controls', true)
    }


    //剪切板
    var clipboard = new Clipboard('#copy-btn');
    clipboard.on('success', function(e) {
        $('#copy-tip-success').css({
            'opacity': 1
        });
        setTimeout(function() {
            $('#copy-tip-success').css({
                'opacity': 0,
                'transition': '0.8s'
            });
        }, 2500)
    });

    $(window).on('beforeunload', function() {
        videoInstance.disconnect();
        if (participants.length == 0) {
            ref.remove();
            $('.d_show').empty();
        }
    });
    clipboard.on('error', function(e) {});

}

var getReandomColor = function() {
    return '#' + (function(h) {
        return new Array(7 - h.length).join("0") + h
    })((Math.random() * 0x1000000 << 0).toString(16))
}
var getReandomTop = function() {
    return Math.floor(Math.random() * ($(".d_show").height() - 20)) + 20;
}

wd.video.barrage = function() {
    $(".s_sub").click(function() {
        var text = $(".s_txt").val();
        var space = Math.floor(Math.random() * (50 - 10)) + 10;
        ref.child('message').push(text);
        $(".s_txt").val('');
    });

    $(".s_txt").keypress(function(event) {
        if (event.keyCode == "13") {
            $(".s_sub").trigger('click');
        }
    });

    ref.child('message').on('child_added', function(snapshot) {
        var text = snapshot.val();
        var textObj = $("<marquee />");
        textObj.text(text).css({
            'color': getReandomColor(),
            'top': getReandomTop()
        });
        $(".d_show").append(textObj);
    });
};



function addStream(participant) {
    participants.push(participant);
    displayStreams(participants);
};

function removeStream(participant) {
    participants.forEach(function(element, index) {
        if (element.constrains.streamId == participant.streamId) {
            participants.splice(index, 1);
            displayStreams(participants);
        }

    });
};

function displayStreams(participants) {
    switch (participants.length + 1) {
        case 1:
            $('#videos-line1').attr('class', 'videos-line1-1');
            $('#videos-line2').removeClass('videos-line2-56');
            if (window.innerHeight < 700) {
                $('video').height(300);
            }
            break;
        case 2:
            $('#videos-line1').attr('class', 'videos-line1-2');
            $('#videos-line2').removeClass('videos-line2-34');
            participants[0].attach($('#remoteParticipant-0').children()[0]);
            break;
        case 3:
            $('#videos-line1').attr('class', 'videos-line1-3');
            $('#videos-line2').attr('class', 'videos-line2-34');
            participants[0].attach($('#remoteParticipant-2').children()[0]);
            participants[1].attach($('#remoteParticipant-3').children()[0]);
            break;
        case 4:
            $('#videos-line1').attr('class', 'videos-line1-4');
            $('#videos-line2').attr('class', 'videos-line2-34');
            $('#videos-line2').removeClass('videos-line2-56');
            participants[0].attach($('#remoteParticipant-0').children()[0]);
            participants[1].attach($('#remoteParticipant-2').children()[0]);
            participants[2].attach($('#remoteParticipant-3').children()[0]);
            break;
        case 5:
            $('#videos-line1').attr('class', 'videos-line1-5');
            $('#videos-line2').attr('class', 'videos-line2-56');
            participants[0].attach($('#remoteParticipant-0').children()[0]);
            participants[1].attach($('#remoteParticipant-2').children()[0]);
            participants[2].attach($('#remoteParticipant-3').children()[0]);
            participants[3].attach($('#remoteParticipant-4').children()[0]);
            break;
        case 6:
            $('#videos-line1').attr('class', 'videos-line1-6');
            $('#videos-line2').attr('class', 'videos-line2-56');
            participants[0].attach($('#remoteParticipant-0').children()[0]);
            participants[1].attach($('#remoteParticipant-1').children()[0]);
            participants[2].attach($('#remoteParticipant-2').children()[0]);
            participants[3].attach($('#remoteParticipant-3').children()[0]);
            participants[4].attach($('#remoteParticipant-4').children()[0]);
            break;
    }
}


function launchFullscreen(element) {
    //此方法不可以在異步任務中執行，否則火狐無法全屏
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    } else if (element.oRequestFullscreen) {
        element.oRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
    } else {
        var docHtml = document.documentElement;
        var docBody = document.body;
        var videobox = document.getElementById('videobox');
        var cssText = 'width:100%;height:100%;overflow:hidden;';
        docHtml.style.cssText = cssText;
        docBody.style.cssText = cssText;
        videobox.style.cssText = cssText + ';' + 'margin:0px;padding:0px;';
        document.IsFullScreen = true;
    }
}
