function convert() {
		var  output=document.getElementById("bin");  
		var input=document.getElementById("input_text").value;
		var padding = "00000000";
		var temp;
		output.value = "";
		for (i=0; i < input.length; i++) {
			temp = input[i].charCodeAt(0).toString(2) 
 			output.value += padding.substring(0, padding.length - temp.length) + temp;
    }
}