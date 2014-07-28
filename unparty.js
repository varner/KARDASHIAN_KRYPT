function decode() {
    var element = document.getElementById("canvii"),
    c = element.getContext("2d"),
    width  = element.width,
    height = element.height,
    imageData = c.getImageData(0, 0, width, height);
    alert("fuck");

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
    alert(msg);
}