var prepped;

function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

function encode() {
    alert("fuck");
    var msg = document.getElementById("input_text").value;
    toImage(msg);
}

function toImage(msg) {
    //convert to binary
    prepped = "";
	var padding = "00000000";
	var temp;
	for (i=0; i < msg.length; i++) {
		temp = msg[i].charCodeAt(0).toString(2);
 		prepped += padding.substring(0, padding.length - temp.length) + temp;
    }
    prepped += padding; //null character

    //add our img to canvas
    im = new Image;
	im.onload = imageLoaded;
	im.src = "kim.png"; 
}

function imageLoaded(ev) {
    var element = document.getElementById("canvii");
    var c = element.getContext("2d");
    var encodedData;
    int bite;
    width  = element.width;
    height = element.height;

    im = ev.target;
    c.drawImage(im, 0, 0);

    imageData = c.getImageData(0, 0, width, height);

    for (var dataIndex = 0; dataIndex < imageData.data.length; dataIndex++) {
        // no salting, very simple.
        if (dataIndex % 4 != 3 && dataIndex < prepped.length) {
            bite  = Integer.parseInt(prepped.charAt(charIndex));
            chan = imageData.data[dataIndex];
            if (bite == 1 && chan % 2 == 0) {
                imageData.data[dataIndex] += 1;
            } else if (bite == 0 && chan % 2 == 1) {
                imageData.data[dataIndex] -= 1;
            }
        }
        // add the data!
        encodedData += String.fromCharCode(imageData.data[dataIndex]);
    }
    c.putImageData(imageData, 0, 0);
}

function why() {
    var exportMe = element.toDataURL();
    window.open(exportImg, 'new');
}

function decode() {
    alert("fuck");
}