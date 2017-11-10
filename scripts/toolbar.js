var wdBoard;

function getInfoFromFilePath(filePath) {
    var nameArray = filePath.split('/');
    var name = nameArray[nameArray.length - 1];

    var typeArray = name.split('.');
    var type = typeArray[typeArray.length - 1];

    return {
        name: name,
        type: type
    };
};

var initWildBoard = function(appId, path, uid, options) {

    var config = {
        syncURL: "https://" + appId + ".wilddogio.com/" + path + '/board', //输入节点 URL
        authDomain: appId + '.wilddog.com',
        websocketOnly: true
    };
    wilddog.initializeApp(config);
    var ref = wilddog.sync();
    wdBoard = new WildBoard(ref, uid, 'canvas', options);

    wdBoard.on('boardInited', function() {
        console.log('boardInited---', Date.now())
    });
    if (config.domainUrl) {
        var uptoken = genUpToken(config.accessKey, config.secretKey, config.putPolicy)
        initImageUpload(wdBoard, uptoken);
    }
};

var uid = Date.now();

var boardConfig = {
    width: $('section').width(),
    height: $('section').height(),
    write: true
}

$(window).resize(function() {
    wdBoard.setOption({
        width: $('section').width(),
        height: $('section').height(),
        write: true
    })
});
initWildBoard(config.boardURL, roomId, uid, boardConfig);

var currentTool = null;
var currentColor = $('#color-0')[0];
var currentSize = $('#stroke-width-0')[0];
var isText = false;
var colorOptions = ['rgb(252,61,57)', 'rgb(252,148,39)', 'rgb(81,214,106)', 'rgb(21,128,249)', 'rgb(202,202,202)', 'rgb(10,10,10)'];
var strokeWidthOptions = [2, 6, 10];
var fontSizeOptions = [18, 28, 40];

var styleCache = {
    Pen: {
        strokeWidthIndex: 0,
        colorIndex: 0,
    },
    Line: {
        strokeWidthIndex: 0,
        colorIndex: 0,
    },
    Rect: {
        strokeWidthIndex: 0,
        colorIndex: 0,
    },
    Circle: {
        strokeWidthIndex: 0,
        colorIndex: 0,
    },
    IText: {
        strokeWidthIndex: 0,
        colorIndex: 0,
    }
}

var addToolListener = function(elId) {
    if (currentTool !== $('#' + elId)[0]) {
        currentSize.classList.remove('size-select-frame');
        if (elId === 'IText') {
            $('#stroke-size-div')[0].hidden = true;
            $('#font-size-div')[0].hidden = false;
            currentSize = $('#font-size-' + styleCache[elId].strokeWidthIndex)[0];
            currentSize.classList.add('size-select-frame');
        } else {
            $('#stroke-size-div')[0].hidden = false;
            $('#font-size-div')[0].hidden = true;
            currentSize = $('#stroke-width-' + styleCache[elId].strokeWidthIndex)[0];
            currentSize.classList.add('size-select-frame');
        };
        currentColor.classList.remove('color-select-frame');
        currentColor = $('#color-' + styleCache[elId].colorIndex)[0];
        currentColor.classList.add('color-select-frame');
        if (currentTool !== null) {
            currentTool.style.backgroundColor = '#3C3C3C';
        };
        currentTool = $('#' + elId)[0];
        currentTool.style.backgroundColor = '#242424';
        $('#tool-style')[0].classList.add('tool-style-display');
        if (elId === 'IText') {
            options = {
                fill: colorOptions[styleCache[elId].colorIndex],
                fontSize: fontSizeOptions[styleCache[elId].strokeWidthIndex],
            }
            wdBoard.on('objectAdded', createTextSingle);
        } else {
            options = {
                stroke: colorOptions[styleCache[elId].colorIndex],
                strokeWidth: strokeWidthOptions[styleCache[elId].strokeWidthIndex],
                fill: 'rgba(0,0,0,0)'
            }
        }
        wdBoard.setTool(elId, options);
    } else {
        setToolToDefault();
    };
};

var setToolToDefault = function() {
    $('#tool-style')[0].classList.remove('tool-style-display');
    currentTool.style.backgroundColor = '#3C3C3C';
    currentTool = null;
    wdBoard.setTool('Default', {});
}

var addColorListener = function(elId) {
    var object = wdBoard.getActiveObject();
    var type = currentTool ? currentTool.id : object.type();
    if (type == 'Path') {
        type = 'Pen';
    };
    var id = elId.split('-')[1];
    currentColor.classList.remove('color-select-frame');
    currentColor = $('#' + elId)[0];
    currentColor.classList.add('color-select-frame');
    styleCache[type].colorIndex = id;
    var options;
    if (type === 'IText') {
        options = {
            fill: colorOptions[styleCache[type].colorIndex],
            fontSize: fontSizeOptions[styleCache[type].strokeWidthIndex],
        }
    } else {
        options = {
            stroke: colorOptions[styleCache[type].colorIndex],
            strokeWidth: strokeWidthOptions[styleCache[type].strokeWidthIndex],
            fill: 'rgba(0,0,0,0)'
        }
    };
    if (currentTool) {
        wdBoard.setTool(type, options);
    } else {
        object.updateOptions(options);
    }
};

var addSizeListener = function(elId) {
    var object = wdBoard.getActiveObject();
    var type = currentTool ? currentTool.id : object.type();
    if (type == 'Path') {
        type = 'Pen';
    };
    var id = elId.split('-')[2];
    currentSize.classList.remove('size-select-frame');
    currentSize = $('#' + elId)[0];
    currentSize.classList.add('size-select-frame');
    styleCache[type].strokeWidthIndex = id;
    var options;
    if (type === 'IText') {
        options = {
            fill: colorOptions[styleCache[type].colorIndex],
            fontSize: fontSizeOptions[styleCache[type].strokeWidthIndex],
        }
    } else {
        options = {
            stroke: colorOptions[styleCache[type].colorIndex],
            strokeWidth: strokeWidthOptions[styleCache[type].strokeWidthIndex],
            fill: 'rgba(0,0,0,0)'
        }
    }
    if (currentTool) {
        wdBoard.setTool(type, options);
    } else {
        object.updateOptions(options);
    }
};

$('#Pen')[0].onclick = function() {
    addToolListener('Pen');
};
$('#Line')[0].onclick = function() {
    addToolListener('Line');
};
$('#Rect')[0].onclick = function() {
    addToolListener('Rect');
};
$('#Circle')[0].onclick = function() {
    addToolListener('Circle');
};
$('#IText')[0].onclick = function() {
    addToolListener('IText');
};
$('#Undo')[0].onclick = function() {
    wdBoard.undo();
};
$('#Clear')[0].onclick = function() {
    var selectedObject = wdBoard.getActiveObject();
    if (selectedObject) {
        selectedObject.removeFromCanvas();
    } else {
        $('#tool-tip')[0].hidden = false;
    };
};

$('#color-0')[0].onclick = function() {
    addColorListener('color-0');
}
$('#color-1')[0].onclick = function() {
    addColorListener('color-1');
}
$('#color-2')[0].onclick = function() {
    addColorListener('color-2');
}
$('#color-3')[0].onclick = function() {
    addColorListener('color-3');
}
$('#color-4')[0].onclick = function() {
    addColorListener('color-4');
}
$('#color-5')[0].onclick = function() {
    addColorListener('color-5');
};

$('#stroke-width-0')[0].onclick = function() {
    addSizeListener('stroke-width-0');
}
$('#stroke-width-1')[0].onclick = function() {
    addSizeListener('stroke-width-1');
}
$('#stroke-width-2')[0].onclick = function() {
    addSizeListener('stroke-width-2');
}
$('#font-size-0')[0].onclick = function() {
    addSizeListener('font-size-0');
}
$('#font-size-1')[0].onclick = function() {
    addSizeListener('font-size-1');
}
$('#font-size-2')[0].onclick = function() {
    addSizeListener('font-size-2');
}

var objectSelectedHandler = function(object) {
    if (object.type() === "Image") {
        return;
    };
    $('#tool-style')[0].classList.add('tool-style-display');
    currentSize.classList.remove('size-select-frame');
    if (object.type() === 'IText') {
        $('#stroke-size-div')[0].hidden = true;
        $('#font-size-div')[0].hidden = false;
        currentSize = $('#font-size-' + fontSizeOptions.indexOf(object.toJSON().style.fontSize))[0];
        currentSize.classList.add('size-select-frame');
    } else {
        $('#stroke-size-div')[0].hidden = false;
        $('#font-size-div')[0].hidden = true;
        currentSize = $('#stroke-width-' + strokeWidthOptions.indexOf(object.toJSON().style.strokeWidth))[0];
        currentSize.classList.add('size-select-frame');
    };
    if (object.toJSON().style.stroke) {
        currentColor.classList.remove('color-select-frame');
        currentColor = $('#color-' + colorOptions.indexOf(object.toJSON().style.stroke))[0];
        currentColor.classList.add('color-select-frame');
    }
};

var objectDeselectedHandler = function(object) {
    if (currentTool == null) {
        $('#tool-style')[0].classList.remove('tool-style-display');
    }
}

wdBoard.on('objectSelected', objectSelectedHandler);
wdBoard.on('objectDeselected', objectDeselectedHandler)

var createTextSingle = function(object) {
    if (object.toJSON().type === 'IText' && object.toJSON().authorId === uid) {
        setToolToDefault();
    };
    setTimeout(function() {
        wdBoard.off('objectAdded', createTextSingle);
    }, 0);
}

$('#close-tool-tip-btn')[0].onclick = function() {
    $('#tool-tip')[0].hidden = true
}

$('#tooltip-confirm-btn')[0].onclick = function() {
    wdBoard.clearPage(wdBoard.currentPage());
    $('#tool-tip')[0].hidden = true
}

$('#tooltip-cancel-btn')[0].onclick = function() {
    $('#tool-tip')[0].hidden = true
}
