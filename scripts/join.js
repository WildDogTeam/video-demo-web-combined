$(function () {
    $('#data').text(new Date().getFullYear())

    $('input').focus(function() {
        $(this).siblings('.room-list').fadeIn();
    })

    $('input').blur(function() {
        $(this).siblings('.room-list').fadeOut();
    })


    $('.room-list li').click(function() {
        $(this).parent().siblings('input').val($(this).text())
    });

    $('#join-btn').click(function() {
        if ($('#room').val() != '' && $('#name').val() != '' && $('#dimension').val() != '') {
           var url = encodeURI('/product/webrtc-demo/meeting?room=' + $('#room').val() + '&name=' + $('#name').val() + '&dimension=' + $('#dimension').val());
           location.href = url;
       }else{
        console.log('空')
       }
    })
    $('#join-btn-s').click(function() {
        if ($('#room-s').val() != '' && $('#dimension-s').val() != '') {
           var url = encodeURI('/product/webrtc-demo/room?room=' + $('#room-s').val() + '&dimension=' + $('#dimension-s').val());
           location.href = url;
       }else{
        console.log('空')
       }
    })
})

