// KARDASHIANKRYPT.JS
// a stupid as fuck chrome extension
// by xX_mAdDy_VaRnEr_Xx
//
// i luv u kim pls high five kanye 4 me xoxo
// hmu: FFFFF.AT | SLITSCANNED.COM | FFFERAL.NET | @MLVARNER

// ~*~* ENCODE *~*~

var files = 1;

function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

function codify(imageData, phrase) {
    var charIndex = 0,
        encodedData = "",
        bite;
    for (dataIndex = 0; dataIndex < imageData.data.length; dataIndex++) {
        //// no salting, very simple.
        if ((dataIndex % 4 != 3) && (charIndex < phrase.length)) {
            bite = parseInt(phrase.substring(charIndex,charIndex+1), 10);
            chan = imageData.data[dataIndex];
            if (bite == 1 && (chan % 2 == 0)) {
                imageData.data[dataIndex] += 1;
            } else if (bite == 0 && chan % 2 == 1) {
                imageData.data[dataIndex] -= 1;
            }
            charIndex++;
        }
        // add the data!
        encodedData += String.fromCharCode(imageData.data[dataIndex]);
    }
    return encodedData;
}

function encode() {
    var msg     = document.getElementById("input_text").value,
        encoded = toImage(msg),
        rawUrl  = generateRaw(),
        dataUrl = 'data:image/png;base64,',
        rawImg  = document.createElement("img");
    rawImg.src = rawUrl;

    var can         = document.createElement("canvas");
    can.width       = rawImg.width;
    can.height      = rawImg.height;

    //push img data
    var c = can.getContext("2d");
    c.drawImage(rawImg, 0, 0);
    imageData = c.getImageData(0, 0, can.width, can.height);
    c.putImageData(imageData, 0, 0);
    //make png
    var encodedData = codify(imageData, encoded);
    pngFile = generatePng(rawImg.width, rawImg.height, encodedData);
    base64png = btoa(pngFile);//Base64.encode(pngFile);
    dataUrl += base64png;
    document.getElementById('canvasImg').src = dataUrl;
}

function toImage(msg) {
    //convert to binary
    var prepped = "";
	var padding = "00000000";
	var temp;
	for (i=0; i < msg.length; i++) {
		temp = msg[i].charCodeAt(0).toString(2);
 		prepped += padding.substring(0, padding.length - temp.length) + temp;
    }
    prepped += padding; //null character
    return prepped;
}

function generateRaw() {
    var url     = "kim/",
        num     = Math.floor(Math.random() * files);
        url     += num.toString() + ".png";
    return url;
}

function imageLoaded(ev) {
    var element = document.getElementById("canvii"),
        c = element.getContext("2d"),
        encodedData = "",
        bite,
        dataUrl = 'data:image/png;base64,',
        width  = element.width,
        height = element.height;

    im = ev.target;
    c.drawImage(im, 0, 0);

    imageData = c.getImageData(0, 0, width, height);
    charIndex = 0;
    for (dataIndex = 0; dataIndex < imageData.data.length; dataIndex++) {
        //// no salting, very simple.
        if ((dataIndex % 4 != 3) && (charIndex < prepped.length)) {
            bite = parseInt(prepped.substring(charIndex,charIndex+1), 10);
            chan = imageData.data[dataIndex];
            if (bite == 1 && (chan % 2 == 0)) {
                imageData.data[dataIndex] += 1;
            } else if (bite == 0 && chan % 2 == 1) {
                imageData.data[dataIndex] -= 1;
            }
            charIndex++;
        }
        // add the data!
        encodedData += String.fromCharCode(imageData.data[dataIndex]);
        //encodedData += "=="; 
    }
    c.putImageData(imageData, 0, 0);
    //make png
    pngFile = generatePng(width, height, encodedData);

    base64png = btoa(pngFile);//Base64.encode(pngFile);
    dataUrl += base64png;
    document.getElementById('canvasImg').src = dataUrl;
}

// ~*~* DECODE *~*~

function decode() {
    //make canvas
    var can         = document.createElement("canvas"),
        img         = document.getElementById("decodeImg");
    can.width = img.width;
    can.height = img.height;

    //push img data
    var c = can.getContext("2d");
    c.drawImage(img, 0, 0);
    imageData = c.getImageData(0, 0, can.width, can.height);

    var msg = algo(imageData);
    document.getElementById("output_text").value = msg;
}

function algo(imageData) {
        var nullFinder = 0,
        counter = 0,
        cCounter = 0;
        character = "",
        msg = "",
        num = 0;
    while (nullFinder < 8 || counter < imageData.length) {
        num = imageData.data[counter];
        if (cCounter == 8) {
            msg += String.fromCharCode(parseInt(character, 2));
            character = "";
            cCounter = 0;
        }
        if (counter % 4 != 3) {
            if (num % 2 == 0) {
                character += "0";
                cCounter += 1;
                nullFinder += 1;
            } else {
                character += "1";
                cCounter += 1;
                nullFinder = 0;
            }
        }
        counter++;
    }
    return msg; 
}

function gotImg(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('decodeImg').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }  
}

