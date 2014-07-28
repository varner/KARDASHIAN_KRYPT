function decode() {
    //make canvas
    var can         = document.createElement("canvas"),
        img         = document.getElementById("decodeImg");
    can.width = img.width;
    can.height = img.height;

    var c = can.getContext("2d");
    c.drawImage(img, 0, 0);
    imageData = c.getImageData(0, 0, can.width, can.height);

    var msg = algo(imageData);
    alert(msg);
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