var initImageUpload = function(wdBoard, uptoken, domainUrl) {
    if (navigator.userAgent.indexOf('HUAWEI') != -1 || navigator.userAgent.indexOf('XiaoMi') != -1) {
        var imgUploader = Qiniu.uploader({
            runtimes: 'html5,flash,html4', //上传模式,依次退化
            browse_button: 'Image', //上传选择的点选按钮，**必需**
            // uptoken_url: 'http://wildboard.wilddogapp.com/uptoken', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
            uptoken: uptoken, //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
            domain: domainUrl, //bucket 域名，下载资源时用到，**必需**
            get_new_uptoken: false, //设置上传文件的时候是否每次都重新获取新的token
            max_file_size: '100mb', //最大文件体积限制
            flash_swf_url: 'js/plupload/Moxie.swf', //引入flash,相对路径
            max_retries: 3, //上传失败最大重试次数
            dragdrop: false, //开启可拖曳上传
            chunk_size: '4mb', //分块上传时，每片的体积
            auto_start: true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
            init: {
                'FileUploaded': function(up, file, info) {
                    var domain = up.getOption('domain');
                    var res = JSON.parse(info.response);
                    var sourceLink = domain + '/' + res.key;
                    var width = res.w;
                    var height = res.h;
                    var scale = 1;
                    if (width > (wdBoard.getOptions().width / 2)) {
                        scale = (wdBoard.getOptions().width / 2) / width;
                    };
                    var img = wdBoard.createImage(sourceLink, {
                        scaleX: scale,
                        scaleY: scale,
                    });
                    img.on('inited', function() {
                        img.updateOptions({
                            left: wdBoard.getOptions().width / 2,
                            top: wdBoard.getOptions().height / 2,
                        })
                    })
                    img.addToCanvas();
                    var style = img.toJSON();
                },
                'Error': function(up, err, errTip) {
                    console.error(err);
                },
                'Key': function(up, file) {
                    var key = Date.now();
                    return key
                }
            }
        });
    } else {
        var imgUploader = Qiniu.uploader({
            runtimes: 'html5,flash,html4', //上传模式,依次退化
            browse_button: 'Image', //上传选择的点选按钮，**必需**
            // uptoken_url: 'http://wildboard.wilddogapp.com/uptoken', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
            uptoken: uptoken, //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
            domain: domainUrl, //bucket 域名，下载资源时用到，**必需**
            get_new_uptoken: false, //设置上传文件的时候是否每次都重新获取新的token
            max_file_size: '100mb', //最大文件体积限制
            flash_swf_url: 'js/plupload/Moxie.swf', //引入flash,相对路径
            max_retries: 3, //上传失败最大重试次数
            dragdrop: false, //开启可拖曳上传
            chunk_size: '4mb', //分块上传时，每片的体积
            auto_start: true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
            filters: {
                mime_types: [{
                    title: "Image files",
                    extensions: "jpeg,jpg,gif,png"
                }]
            },
            init: {
                'FileUploaded': function(up, file, info) {
                    var domain = up.getOption('domain');
                    var res = JSON.parse(info.response);
                    var sourceLink = domain + '/' + res.key;
                    var width = res.w;
                    var height = res.h;
                    var scale = 1;
                    if (width > (wdBoard.getOptions().width / 2)) {
                        scale = (wdBoard.getOptions().width / 2) / width;
                    };
                    var img = wdBoard.createImage(sourceLink, {
                        scaleX: scale,
                        scaleY: scale,
                    });
                    img.on('inited', function() {
                        img.updateOptions({
                            left: wdBoard.getOptions().width / 2,
                            top: wdBoard.getOptions().height / 2,
                        })
                    })
                    img.addToCanvas();
                    var style = img.toJSON();
                },
                'Error': function(up, err, errTip) {
                    console.error(err);
                },
                'Key': function(up, file) {
                    var key = Date.now();
                    return key
                }
            }
        });
    }
}
