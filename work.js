function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

function encode() {
	var  output=document.getElementById("bin");  
	var input=document.getElementById("input_text").value;
	var padding = "00000000";
	var temp;
	output.value = "";
	for (i=0; i < input.length; i++) {
		temp = input[i].charCodeAt(0).toString(2) 
 		output.value += padding.substring(0, padding.length - temp.length) + temp;
    }
    output.value += padding; //null character

    //canvas shit

    im = new Image();
	im.onload = imageLoaded;
	im.src = "kim.png"; 
}

function imageLoaded(ev) {
	output = document.getElementById("bin").value;
    element = document.getElementById("canvii");
    c = element.getContext("2d");
    width  = element.width;
    height = element.height;

    im = ev.target;
    c.drawImage(im, 0, 0);
    imageData = c.getImageData(0, 0, width, height);
    for (poopy = 0; poopy < output.length; poopy++) {
    	bitty = output.charAt(poopy);
        transformer = imageData.data[poopy*4];
        if (bitty == 1 && (transformer % 2 == 0)) {
            imageData[poopy*4] += 1;
    	} else if (bitty == 0 && (transformer % 2 == 1)) {
    		imageData[poopy*4] -= 1;
    	}
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