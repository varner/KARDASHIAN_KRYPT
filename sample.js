window.onload = init;

var toolbar, toolbarHeader, layersElement, layersHeader, strokePickerElement, fillPickerElement, draggableToolbar, draggableNav;
var canvasElement, canvas, mainWidth, mainHeight;
var strokeCreate, strokeCreateHeader, draggableStroke, fillCreate, fillCreateHeader, draggableFill;
var canvasNav, canvasNavHeader, canvasNavClose, moveCanvas;
var currentImg, currentImg01, burrer01, buffer02;
var exportEl, exportImg, openFileEl, importFile, darkEl, colorEl, newEl, lineCapEl;
var buffer = {};
var strokeEl = {};
var fillEl = {};
var darkEl = {};
var colorEl = {};
var levelsEl = {};
var channelLevelsEl = {};
var saturationEl = {};
var newCanvasEl = {};
var bufferEl = {};
var fillTarget = {};
var penPoints = [];
var bez3Points = [];
var strokeWidth = 3;
var twoPi = 2 * Math.PI;
var strokeIsVisible = false;
var canRedo = false;
var mouseIsDown = false;
var bufferToggle = true;
var isFill = false;
var isStroke = true;
var bufferTest = new Buffer(11);
var initCvs = {
	x: 450,
	y: 400
};
var canvasPos = {
	x: 200, 
	y: 150
};
var fillThresh = {
	val: 20
};
var stroke = {
	r: 0,
	g: 0,
	b: 0,
	a: 1.0
};
var fill = {
	r: 0,
	g: 0,
	b: 0,
	a: 1.0
};

function init(){
	getDims();
	getDomElements();
	createDraggables();
	registerNavListeners();
	createCanvas();
	wipeCanvas(255, 255, 255, true);
	initToolbar();
	registerColorListener();
	registerSliderWidthListeners();
	registerGlobalKeyListeners();
	registerUndoRedo();
	registerMiscListeners();
	registerImageEditListeners();

	registerNewCanvasListeners();
}

function exportImage(){
	exportImg = canvasElement.toDataURL();
	window.open(exportImg, 'new');
}

function registerMiscListeners(){
	
	exportEl.addEventListener('click', function(e){
		e.preventDefault();
		exportImage();
	}, false);
	openFileEl.addEventListener('change', function(e){
		var file = openFileEl.files;
        var img = new Image();
        img.src = URL.createObjectURL(file[0]);
        img.onload = function(){
        	canvasElement.width = img.width;
        	canvasElement.height = img.height;
        	canvas.width = img.width;
        	canvas.height = img.height;
        	canvas.drawImage(img, 0, 0, img.width, img.height);
        	buffer.active = canvas.getImageData(0, 0, canvas.width, canvas.height);
        	activeRender();
        	bufferTest.reset(buffer.active);
        }
	}, false);

}

function registerNewCanvasListeners(){
	newCanvasEl.button.addEventListener('click', function(e){
		e.preventDefault();
		newCanvasEl.main.style.cssText = 'display: block';
		newCanvasEl.dragg.moveElementPosition(0, 0);
	}, false);
	newCanvasEl.cancel.addEventListener('click', function(e){
		e.preventDefault();
		newCanvasEl.main.style.cssText = 'display: none';
	}, false);
	newCanvasEl.ok.addEventListener('click', function(e){
		e.preventDefault();
		var tempWidth = parseInt(newCanvasEl.inputWidth.value);
		var tempHeight = parseInt(newCanvasEl.inputHeight.value);
		canvasElement.width = tempWidth;
		canvasElement.height = tempHeight;
		canvas.width = canvasElement.width;
		canvas.height = canvasElement.height;
		wipeCanvas(255, 255, 255, true);
		newCanvasEl.main.style.cssText = 'display: none';
	}, false);
}

function registerImageEditListeners(){
	darkEl.darkVal = 0;
	darkEl.lightVal = 255;
	darkEl.binVal = 255;

	//show dark edit
	darkEl.button.addEventListener('click', function(e){
		e.preventDefault();
		darkEl.main.style.cssText = 'display: block';
		darkEl.dragg.moveElementPosition(0, 0);
		darkEdit();
	}, false);

	//dark edit sliders
	darkEl.darkSlider.addEventListener('change', function(e){
		e.preventDefault();
		var val = darkEl.darkSlider.value;
		darkEl.darkVal = parseInt(val);
		darkEl.darkOut.innerHTML = val;
		darkEdit();
	}, false);
	darkEl.lightSlider.addEventListener('change', function(e){
		e.preventDefault();
		var val = darkEl.lightSlider.value;
		darkEl.lightVal = parseInt(val);
		darkEl.lightOut.innerHTML = val;
		darkEdit();
	}, false);
	darkEl.binSlider.addEventListener('change', function(e){
		e.preventDefault();
		var val = darkEl.binSlider.value;
		darkEl.binVal = parseInt(val);
		darkEl.binOut.innerHTML = val - 1;
		darkEdit();
	}, false);

	//dark edit: OK / Cancel
	darkEl.ok.addEventListener('click', function(e){
		e.preventDefault();
		buffer.active = buffer.temp;
		activeRender();
		swapBuffers();
		darkEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);
	darkEl.cancel.addEventListener('click', function(e){
		e.preventDefault();
		activeRender();
		darkEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);

	colorEl.rVal = 1.0;
	colorEl.gVal = 1.0;
	colorEl.bVal = 1.0;

	//show color edit
	colorEl.button.addEventListener('click', function(e){
		e.preventDefault();
		colorEl.main.style.cssText = 'display: block';
		colorEl.dragg.moveElementPosition(0, 0);
		rgbEdit();
	}, false);

	//color edit sliders
	colorEl.sliderR.addEventListener('change', function(e){
		e.preventDefault();
		colorEl.rVal = parseFloat(colorEl.sliderR.value);
		colorEl.outR.innerHTML = colorEl.rVal;
		rgbEdit();
	}, false);
	colorEl.sliderG.addEventListener('change', function(e){
		e.preventDefault();
		colorEl.gVal = parseFloat(colorEl.sliderG.value);
		colorEl.outG.innerHTML = colorEl.gVal;
		rgbEdit();
	}, false);
	colorEl.sliderB.addEventListener('change', function(e){
		e.preventDefault();
		colorEl.bVal = parseFloat(colorEl.sliderB.value);
		colorEl.outB.innerHTML = colorEl.bVal;
		rgbEdit();
	}, false);

	//color edit: OK / Cancel
	colorEl.ok.addEventListener('click', function(e){
		e.preventDefault();
		buffer.active = buffer.temp;
		activeRender();
		swapBuffers();
		colorEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);
	colorEl.cancel.addEventListener('click', function(e){
		e.preventDefault();
		activeRender();
		colorEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);

	levelsEl.loVal = 0;
	levelsEl.hiVal = 255;

	//show levels edit
	levelsEl.button.addEventListener('click', function(e){
		e.preventDefault();
		levelsEl.main.style.cssText = 'display: block';
		levelsEl.dragg.moveElementPosition(0, 0);
		levelsEdit();
	}, false);

	//levels edit sliders
	levelsEl.sliderLow.addEventListener('change', function(e){
		e.preventDefault();
		levelsEl.loVal = parseInt(levelsEl.sliderLow.value);
		levelsEl.lowOut.innerHTML = levelsEl.loVal;
		levelsEdit();
	}, false);
	levelsEl.sliderHi.addEventListener('change', function(e){
		e.preventDefault();
		levelsEl.hiVal = parseInt(levelsEl.sliderHi.value);
		levelsEl.hiOut.innerHTML = levelsEl.hiVal;
		levelsEdit();
	}, false);

	//levels edit: OK / Cancel
	levelsEl.ok.addEventListener('click', function(e){
		e.preventDefault();
		buffer.active = buffer.temp;
		activeRender();
		swapBuffers();
		levelsEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);
	levelsEl.cancel.addEventListener('click', function(e){
		e.preventDefault();
		activeRender();
		levelsEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);

	saturationEl.val = 1.0;

	//show saturation edit
	saturationEl.button.addEventListener('click', function(e){
		e.preventDefault();
		saturationEl.main.style.cssText = 'display: block';
		saturationEl.dragg.moveElementPosition(0, 0);
		rgbEdit(saturationEl.val);
	}, false);

	//saturation edit sliders
	saturationEl.slider.addEventListener('change', function(e){
		e.preventDefault();
		saturationEl.val = parseFloat(saturationEl.slider.value);
		saturationEl.out.innerHTML = saturationEl.val;
		rgbEdit(saturationEl.val);
	}, false);

	//saturation edit: OK / Cancel
	saturationEl.ok.addEventListener('click', function(e){
		e.preventDefault();
		buffer.active = buffer.temp;
		activeRender();
		swapBuffers();
		saturationEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);
	saturationEl.cancel.addEventListener('click', function(e){
		e.preventDefault();
		activeRender();
		saturationEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);

	channelLevelsEl.rLoVal = 0;
	channelLevelsEl.rHiVal = 255;
	channelLevelsEl.gLoVal = 0;
	channelLevelsEl.gHiVal = 255;
	channelLevelsEl.bLoVal = 0;
	channelLevelsEl.bHiVal = 255;

	//show channelLevels edit
	channelLevelsEl.button.addEventListener('click', function(e){
		e.preventDefault();
		channelLevelsEl.main.style.cssText = 'display: block';
		channelLevelsEl.dragg.moveElementPosition(0, 0);
		channelLevelsEdit();
	}, false);

	//channelLevels edit sliders
	channelLevelsEl.sliderRlow.addEventListener('change', function(e){
		e.preventDefault();
		channelLevelsEl.rLoVal = parseInt(channelLevelsEl.sliderRlow.value);
		channelLevelsEl.rLowOut.innerHTML = channelLevelsEl.rLoVal;
		channelLevelsEdit();
	}, false);
	channelLevelsEl.sliderRhi.addEventListener('change', function(e){
		e.preventDefault();
		channelLevelsEl.rHiVal = parseInt(channelLevelsEl.sliderRhi.value);
		channelLevelsEl.rHiOut.innerHTML = channelLevelsEl.rHiVal;
		channelLevelsEdit();
	}, false);
	channelLevelsEl.sliderGlow.addEventListener('change', function(e){
		e.preventDefault();
		channelLevelsEl.gLoVal = parseInt(channelLevelsEl.sliderGlow.value);
		channelLevelsEl.gLowOut.innerHTML = channelLevelsEl.gLoVal;
		channelLevelsEdit();
	}, false);
	channelLevelsEl.sliderGhi.addEventListener('change', function(e){
		e.preventDefault();
		channelLevelsEl.gHiVal = parseInt(channelLevelsEl.sliderGhi.value);
		channelLevelsEl.gHiOut.innerHTML = channelLevelsEl.gHiVal;
		channelLevelsEdit();
	}, false);
	channelLevelsEl.sliderBlow.addEventListener('change', function(e){
		e.preventDefault();
		channelLevelsEl.bLoVal = parseInt(channelLevelsEl.sliderBlow.value);
		channelLevelsEl.bLowOut.innerHTML = channelLevelsEl.bLoVal;
		channelLevelsEdit();
	}, false);
	channelLevelsEl.sliderBhi.addEventListener('change', function(e){
		e.preventDefault();
		channelLevelsEl.bHiVal = parseInt(channelLevelsEl.sliderBhi.value);
		channelLevelsEl.bHiOut.innerHTML = channelLevelsEl.bHiVal;
		channelLevelsEdit();
	}, false);

	//channelLevels edit: OK / Cancel
	channelLevelsEl.ok.addEventListener('click', function(e){
		e.preventDefault();
		buffer.active = buffer.temp;
		activeRender();
		swapBuffers();
		channelLevelsEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);
	channelLevelsEl.cancel.addEventListener('click', function(e){
		e.preventDefault();
		activeRender();
		channelLevelsEl.main.style.cssText = 'display: none';
		buffer.temp = null;
	}, false);	
}

function registerUndoRedo(){
	bufferEl.undo.addEventListener('click', function(e){
		e.preventDefault();
		undo();
	}, false);
	bufferEl.redo.addEventListener('click', function(e){
		e.preventDefault();
		if (canRedo){
			var temp = buffer.inactive;
			buffer.inactive = buffer.active;
			buffer.active = temp;
			redo();
			canRedo = false;
		}
	}, false);
}

function registerGlobalKeyListeners(){
	window.addEventListener('keydown', function(e){
		
		switch(e.keyCode){
			//left
			case 37:
				if (e.ctrlKey){
					moveCanvas(-15, 0);
				}
				break;
			//right
			case 39:
				if (e.ctrlKey){
					moveCanvas(15, 0);
				}
				break;
			//up
			case 38:
				if (e.ctrlKey){
					moveCanvas(0, -15);
				}
				break;
			//down
			case 40:
				if (e.ctrlKey){
					moveCanvas(0, 15);
				}
				break;

			//esc
			case 27:
				mouseIsDown = false;
				penPoints = [];
				bez3Points = [];
				//bez4Points = [];
				activeRender();
				break;

			//ctrl+z
			case 90:
				if (e.ctrlKey){
					undo();
				}
				break;

			//ctrl+y
			case 89:
				if (e.ctrlKey){
					redo();
				}
				break;

			//n : new canvas
			case 78:
				newCanvasEl.main.style.cssText = 'display: block';
				newCanvasEl.dragg.moveElementPosition(0, 0);
				break;

			//s : export
			case 83:
				exportImage();
				break;

			//o : open
			case 79:
				//open image function???
				break;

			//r : rgb
			case 82:
				colorEl.main.style.cssText = 'display: block';
				colorEl.dragg.moveElementPosition(0, 0);
				break;

			//l : levels
			case 76:
				levelsEl.main.style.cssText = 'display: block';
				levelsEl.dragg.moveElementPosition(0, 0);
				break;

			//u : saturation
			case 85:
				saturationEl.main.style.cssText = 'display: block';
				saturationEl.dragg.moveElementPosition(0, 0);
				break;

			//k : channel levels
			case 75:
				channelLevelsEl.main.style.cssText = 'display: block';
				channelLevelsEl.dragg.moveElementPosition(0, 0);
				break;

			//t : threshold
			case 84:
				darkEl.main.style.cssText = 'display: block';
				darkEl.dragg.moveElementPosition(0, 0);
				break;

			/*---------------------------
			 * Toolbar shortcuts: 1 - 9
			 *--------------------------*/
			case 49:
				toolstate.setActiveTool('line');
				break;

			case 50:
				toolstate.setActiveTool('circle');
				break;

			case 51:
				toolstate.setActiveTool('pen');
				break;

			case 52:
				toolstate.setActiveTool('brush');
				break;

			case 53:
				toolstate.setActiveTool('fill');
				break;

			case 54:
				toolstate.setActiveTool('bez3');
				break;

			case 55:
				toolstate.setActiveTool('rect');
				break;

			case 56:
				toolstate.setActiveTool('setStroke');
				break;

			case 57:
				toolstate.setActiveTool('setFill');
				break;
		}
	}, false);

	/*
	 * Something like this to get rid of auto highlight
	 */
	/*
	window.addEventListener('mousedown', function(e){
		e.preventDefault();
	}, false);
	*/
}

function registerSliderWidthListeners(){
	strokeEl.slider.addEventListener('change', function(e){
		strokeWidth = e.target.value;
		strokeEl.sliderOut.innerHTML = strokeWidth;
		canvas.lineWidth = strokeWidth;
	}, false);

	lineCapEl.addEventListener('change', function(e){
		canvas.lineCap = e.target.value;
	}, false);
}

function registerColorListener(){
	
	strokePickerElement.addEventListener('click', function(e){
		e.preventDefault();
		strokeCreate.style.cssText = 'display: block';
		draggableStroke.moveElementPosition(0, 0);
	}, false);
	fillPickerElement.addEventListener('click', function(e){
		e.preventDefault();
		fillCreate.style.cssText = 'display: block';
		draggableFill.moveElementPosition(0, 0);
	}, false);

	/*---------------------
	 *	Stroke Color
	 *--------------------*/
	strokeEl.rIn.addEventListener('change', function(e){
		e.preventDefault();
		stroke.r = e.target.value;
		strokeEl.rOut.innerHTML = e.target.value;
		strokeEl.disp.style.cssText = 'background: ' + getStrokeColor();
	}, false);

	strokeEl.gIn.addEventListener('change', function(e){
		e.preventDefault();
		stroke.g = e.target.value;
		strokeEl.gOut.innerHTML = e.target.value;
		strokeEl.disp.style.cssText = 'background: ' + getStrokeColor();
	}, false);

	strokeEl.bIn.addEventListener('change', function(e){
		e.preventDefault();
		stroke.b = e.target.value;
		strokeEl.bOut.innerHTML = e.target.value;
		strokeEl.disp.style.cssText = 'background: ' + getStrokeColor();
	}, false);

	strokeEl.aIn.addEventListener('change', function(e){
		e.preventDefault();
		stroke.a = e.target.value;
		strokeEl.aOut.innerHTML = e.target.value;
		strokeEl.disp.style.cssText = 'background: ' + getStrokeColor();
	}, false);

	strokeEl.ok.addEventListener('click', function(e){
		e.preventDefault();
		canvas.strokeStyle = getStrokeColor();
		strokePickerElement.style.cssText = 'background: ' + getStrokeColor();
		strokeCreate.style.cssText = 'display: none';
		//strokeIsVisible = false;
	}, false);
	strokeEl.cancel.addEventListener('click', function(e){
		e.preventDefault();
		strokeCreate.style.cssText = 'display: none';
		//strokeIsVisible = false;
	}, false);
	strokeEl.isStroke.addEventListener('change', function(e){
		e.preventDefault();
		isStroke = strokeEl.isStroke.checked;
	}, false);

	/*---------------------
	 *	fill Color
	 *--------------------*/
	fillEl.rIn.addEventListener('change', function(e){
		e.preventDefault();
		fill.r = e.target.value;
		fillEl.rOut.innerHTML = e.target.value;
		fillEl.disp.style.cssText = 'background: ' + getFillColor();
	}, false);

	fillEl.gIn.addEventListener('change', function(e){
		e.preventDefault();
		fill.g = e.target.value;
		fillEl.gOut.innerHTML = e.target.value;
		fillEl.disp.style.cssText = 'background: ' + getFillColor();
	}, false);

	fillEl.bIn.addEventListener('change', function(e){
		e.preventDefault();
		fill.b = e.target.value;
		fillEl.bOut.innerHTML = e.target.value;
		fillEl.disp.style.cssText = 'background: ' + getFillColor();
	}, false);

	fillEl.aIn.addEventListener('change', function(e){
		e.preventDefault();
		fill.a = e.target.value;
		fillEl.aOut.innerHTML = e.target.value;
		fillEl.disp.style.cssText = 'background: ' + getFillColor();
	}, false);

	fillEl.ok.addEventListener('click', function(e){
		e.preventDefault();
		canvas.fillStyle = getFillColor();
		fillPickerElement.style.cssText = 'background: ' + getFillColor();
		fillCreate.style.cssText = 'display: none';
		//fillIsVisible = false;
	}, false);
	fillEl.cancel.addEventListener('click', function(e){
		e.preventDefault();
		fillCreate.style.cssText = 'display: none';
		//fillIsVisible = false;
	}, false);
	fillEl.isFill.addEventListener('change', function(e){
		e.preventDefault();
		isFill = fillEl.isFill.checked;
	}, false);

	fillThresh.el.addEventListener('change', function(e){
		e.preventDefault();
		fillThresh.val = e.target.value;
		fillThresh.out.innerHTML = e.target.value;
	}, false);

}

function getFillColor(){
	return 'rgba(' + fill.r + ', ' + fill.g + ', ' + fill.b + ', ' + fill.a + ')';
}

function getStrokeColor(){
	return 'rgba(' + stroke.r + ', ' + stroke.g + ', ' + stroke.b + ', ' + stroke.a + ')';
}

function setStrokeColor(r, g, b, a){
	stroke.r = r;
	stroke.g = g;
	stroke.b = b;
	stroke.a = a;
}

function setFillColor(r, g, b, a){
	fill.r = r;
	fill.g = g;
	fill.b = b;
	fill.a = a;
}


function wipeCanvas(r, g, b, init){
	buffer.active = canvas.createImageData(canvas.width, canvas.height);
	for (var i = 0; i < buffer.active.data.length; i += 4){
		buffer.active.data[i + 0] = r;
  		buffer.active.data[i + 1] = g;
  		buffer.active.data[i + 2] = b;
  		buffer.active.data[i + 3] = 255;
	}
	canvas.putImageData(buffer.active, 0, 0);
	if (init){
		bufferTest.reset(buffer.active);
		/*
		buffer.inactive = canvas.createImageData(canvas.width, canvas.height);
		for (var i = 0; i < buffer.inactive.data.length; i += 4){
			buffer.inactive.data[i + 0] = r;
  			buffer.inactive.data[i + 1] = g;
  			buffer.inactive.data[i + 2] = b;
  			buffer.inactive.data[i + 3] = 255;
		}
		*/
	}
}
/*
function passiveRender(){
	canvas.putImageData(buffer.inactive, 0, 0);
	//canvas.putImageData(currentImg, 0, 0);
}
*/
function activeRender(){
	canvas.putImageData(buffer.active, 0, 0);
}

function undo(){
	/*
	canvas.putImageData(buffer.inactive, 0, 0);
	var temp = buffer.inactive;
	buffer.inactive = buffer.active;
	buffer.active = temp;
	canRedo = true;
	*/
	if (bufferTest.undo()){
		canvas.putImageData(bufferTest.getActiveData(), 0, 0);
		buffer.active = bufferTest.getActiveData();
	}
}

function redo(){
	//canvas.putImageData(buffer.active, 0, 0);
	if (bufferTest.redo()){
		canvas.putImageData(bufferTest.getActiveData(), 0, 0);
		buffer.active = bufferTest.getActiveData();
	}
}

function swapBuffers(){
	bufferTest.add(buffer.active);
	buffer.active = bufferTest.getActiveData();
	/*
	for (var i = 0; i < buffer.inactive.data.length; i += 4){
		buffer.inactive.data[i + 0] = buffer.active.data[i + 0];
  		buffer.inactive.data[i + 1] = buffer.active.data[i + 1];
  		buffer.inactive.data[i + 2] = buffer.active.data[i + 2];
  		buffer.inactive.data[i + 3] = buffer.active.data[i + 3];
	}
	canRedo = false;
	*/
}

function registerNavListeners(){

	moveCnvs.addEventListener('mousedown', function(e){
		//show canvas nav
		canvasNav.style.cssText = 'display: block';
		draggableNav.moveElementPosition(0, 0);
	}, false);

	canvasNavClose.addEventListener('mousedown', function(e){
		//hide canvas nav
		canvasNav.style.cssText = 'display: none';
	}, false);

	//mouse hit
	canvasNav.addEventListener('mousedown', function(e){
		e.preventDefault();
		switch(e.target.id) {
			case 'navUp':
				moveCanvas(0, -15);
				break;
			case 'navDown':
				moveCanvas(0, 15);
				break;
			case 'navLeft':
				moveCanvas(-15, 0);
				break;
			case 'navRight':
				moveCanvas(15, 0);
				break;
		}
	}, false);
	
}

function moveCanvas(moveX, moveY){
	canvasPos.x += moveX;
	canvasPos.y += moveY;
	
	canvasElement.style.left = canvasPos.x + 'px';
	canvasElement.style.top = canvasPos.y + 'px';
}

function getDims(){
	mainWidth = window.outerWidth;
	mainHeight = window.outerHeight;
}

function getDomElements(){
	toolbar = document.getElementById('toolbar');
	toolbarHeader = document.getElementById('toolbarHeader');
	canvasElement = document.getElementById('mainCanvas');
	canvasNav = document.getElementById('canvasNav');
	canvasNavHeader = document.getElementById('navHeader');
	canvasNavClose = document.getElementById('closeNav');
	moveCnvs = document.getElementById('moveCnvs');

	fgColor = document.getElementById('fgColor');
	strokePickerElement = document.getElementById('strokeColor');
	fillPickerElement = document.getElementById('fillColor');
	strokeCreate = document.getElementById('strokeCreate');
	strokeCreateHeader = document.getElementById('strokeCreateHeader');
	strokeEl.rIn = document.getElementById('strokeRedIn');
	strokeEl.rOut = document.getElementById('strokeRedOut');
	strokeEl.gIn = document.getElementById('strokeGreenIn');
	strokeEl.gOut = document.getElementById('strokeGreenOut');
	strokeEl.bIn = document.getElementById('strokeBlueIn');
	strokeEl.bOut = document.getElementById('strokeBlueOut');
	strokeEl.aIn = document.getElementById('strokeAlphaIn');
	strokeEl.aOut = document.getElementById('strokeAlphaOut');
	strokeEl.disp = document.getElementById('strokeColorDisplay');
	strokeEl.ok = document.getElementById('strokeOK');
	strokeEl.cancel = document.getElementById('strokeCancel');
	strokeEl.isStroke = document.getElementById('isStroke');
	//strokeEl.getStroke = document.getElementById('getStrokeColor');

	strokeEl.slider = document.getElementById('strokeWidthSlider');
	strokeEl.sliderOut = document.getElementById('strokeWidthOut');
	lineCapEl = document.getElementById('lineCap');

	fillCreate = document.getElementById('fillCreate');
	fillCreateHeader = document.getElementById('fillCreateHeader');
	fillEl.rIn = document.getElementById('fillRedIn');
	fillEl.rOut = document.getElementById('fillRedOut');
	fillEl.gIn = document.getElementById('fillGreenIn');
	fillEl.gOut = document.getElementById('fillGreenOut');
	fillEl.bIn = document.getElementById('fillBlueIn');
 	fillEl.bOut = document.getElementById('fillBlueOut');
	fillEl.aIn = document.getElementById('fillAlphaIn');
	fillEl.aOut = document.getElementById('fillAlphaOut');
	fillEl.disp = document.getElementById('fillColorDisplay');
	fillEl.ok = document.getElementById('fillOK');
	fillEl.cancel = document.getElementById('fillCancel');
	fillEl.isFill = document.getElementById('isFill');

	//strokeEl.div = document.getElementById('strokeColorTool');
	strokeEl.strokeWidthDiv = document.getElementById('strokeWidthDiv');
	strokeEl.strokeStyleDiv = document.getElementById('lineCapOpt');
	//fillEl.div = document.getElementById('fillColorTool');

	bufferEl.undo = document.getElementById('undo');
	bufferEl.redo = document.getElementById('redo');
	exportEl = document.getElementById('export');
	openFileEl = document.getElementById('openFile');

	fillThresh.el = document.getElementById('fillThreshEl');
	fillThresh.out = document.getElementById('fillThreshOut');
	fillThresh.div = document.getElementById('fillThreshDiv');

	darkEl.button = document.getElementById('darkEl');
	darkEl.main = document.getElementById('darkEdit');
	darkEl.header = document.getElementById('darkEditHeader');
	darkEl.ok = document.getElementById('darkEditOk');
	darkEl.cancel = document.getElementById('darkEditCancel');

	darkEl.darkSlider = document.getElementById('darkEditDarkSlider');
	darkEl.lightSlider = document.getElementById('darkEditLightSlider');
	darkEl.binSlider = document.getElementById('darkEditBinSlider');
	darkEl.darkOut = document.getElementById('darkEditDarkOut');
	darkEl.lightOut = document.getElementById('darkEditLightOut');
	darkEl.binOut = document.getElementById('darkEditBinOut');

	colorEl.button = document.getElementById('colorEl');
	colorEl.main = document.getElementById('colorEdit');
	colorEl.header = document.getElementById('colorEditHeader');
	colorEl.ok = document.getElementById('colorEditOk');
	colorEl.cancel = document.getElementById('colorEditCancel');

	colorEl.sliderR = document.getElementById('colorEditSliderR');
	colorEl.outR = document.getElementById('colorEditOutR');
	colorEl.sliderG = document.getElementById('colorEditSliderG');
	colorEl.outG = document.getElementById('colorEditOutG');
	colorEl.sliderB = document.getElementById('colorEditSliderB');
	colorEl.outB = document.getElementById('colorEditOutB');

	levelsEl.button = document.getElementById('levelsEl');
	levelsEl.main = document.getElementById('levelsEdit');
	levelsEl.header = document.getElementById('levelsEditHeader');
	levelsEl.ok = document.getElementById('levelsEditOk');
	levelsEl.cancel = document.getElementById('levelsEditCancel');

	levelsEl.sliderLow = document.getElementById('levelsEditSliderLow');
	levelsEl.lowOut = document.getElementById('levelsEditLowOut');
	levelsEl.sliderHi = document.getElementById('levelsEditSliderHi');
	levelsEl.hiOut = document.getElementById('levelsEditHiOut');

	saturationEl.button = document.getElementById('saturationEl');
	saturationEl.main = document.getElementById('saturationEdit');
	saturationEl.header = document.getElementById('saturationEditHeader');
	saturationEl.ok = document.getElementById('saturationEditOk');
	saturationEl.cancel = document.getElementById('saturationEditCancel');

	saturationEl.slider = document.getElementById('saturationSlider');
	saturationEl.out = document.getElementById('saturationOut');

	channelLevelsEl.button = document.getElementById('channelLevelsEl');
	channelLevelsEl.main = document.getElementById('channelLevels');
	channelLevelsEl.header = document.getElementById('channelLevelsHeader');
	channelLevelsEl.ok = document.getElementById('channelLevelsOk');
	channelLevelsEl.cancel = document.getElementById('channelLevelsCancel');

	channelLevelsEl.sliderRlow = document.getElementById('channelLevelsSliderRlow');
	channelLevelsEl.rLowOut = document.getElementById('channelLevelsRlowOut');
	channelLevelsEl.sliderRhi = document.getElementById('channelLevelsSliderRhi');
	channelLevelsEl.rHiOut = document.getElementById('channelLevelsRhiOut');
	channelLevelsEl.sliderGlow = document.getElementById('channelLevelsSliderGlow');
	channelLevelsEl.gLowOut = document.getElementById('channelLevelsGlowOut');
	channelLevelsEl.sliderGhi = document.getElementById('channelLevelsSliderGhi');
	channelLevelsEl.gHiOut = document.getElementById('channelLevelsGhiOut');
	channelLevelsEl.sliderBlow = document.getElementById('channelLevelsSliderBlow');
	channelLevelsEl.bLowOut = document.getElementById('channelLevelsBlowOut');
	channelLevelsEl.sliderBhi = document.getElementById('channelLevelsSliderBhi');
	channelLevelsEl.bHiOut = document.getElementById('channelLevelsBhiOut');
	
	//newEl = document.getElementById('newCanvas');
	newCanvasEl.button = document.getElementById('newCanvasButton');
	newCanvasEl.main = document.getElementById('newCanvasOptBox');
	newCanvasEl.header = document.getElementById('newCanvasHeader');

	newCanvasEl.ok = document.getElementById('newCanvasOk');
	newCanvasEl.cancel = document.getElementById('newCanvasCancel');
	newCanvasEl.inputWidth = document.getElementById('canvasInW');
	newCanvasEl.inputHeight = document.getElementById('canvasInH');
}

function createDraggables(){
	draggableToolbar = new Draggable(toolbarHeader, toolbar, 15, 100);
	draggableNav = new Draggable(canvasNavHeader, canvasNav, 5, 400);
	draggableStroke = new Draggable(strokeCreateHeader, strokeCreate, 180, 170);
	draggableFill = new Draggable(fillCreateHeader, fillCreate, 250, 270);
	darkEl.dragg = new Draggable(darkEl.header, darkEl.main, 100, 100);
	colorEl.dragg = new Draggable(colorEl.header, colorEl.main, 140, 80);
	levelsEl.dragg = new Draggable(levelsEl.header, levelsEl.main, 140, 80);
	saturationEl.dragg = new Draggable(saturationEl.header, saturationEl.main, 140, 80);
	channelLevelsEl.dragg = new Draggable(channelLevelsEl.header, channelLevelsEl.main, 140, 80);
	newCanvasEl.dragg = new Draggable(newCanvasEl.header, newCanvasEl.main, 150, 160);
}

function initToolbar(){
	toolstate = new ToolStateSystem(['line', 'circle', 'pen', 'brush', 'fill', 'bez3', 'rect', 'setStroke', 'setFill'], canvas);
	toolstate.setActiveTool('line');
}

function createCanvas(){
	canvasElement.style.left = canvasPos.x + 'px';
	canvasElement.style.top = canvasPos.y + 'px';

	canvasElement.width = initCvs.x;
	canvasElement.height = initCvs.y;
	canvas = canvasElement.getContext('2d');
	canvas.width = canvasElement.width;
	canvas.height = canvasElement.height;

	/*
	 * init render state system here instead
	 *
	 */
	canvas.fillStyle = '#000000';
	canvas.strokeStyle = 'rgb(0, 0, 0)';
	canvas.lineWidth = strokeWidth;
	canvas.lineCap = 'square';
	canvas.fillRect(0, 0, canvas.width, canvas.height);

	canvasElement.addEventListener('mousedown', function(e){
		mouseIsDown = true;
		toolstate.mousedown(
			e.pageX - canvasElement.offsetLeft,
			e.pageY - canvasElement.offsetTop
		);
	}, false);
	canvasElement.addEventListener('mousemove', function(e){
		e.preventDefault();
		if (mouseIsDown){
			toolstate.mousemove(
				e.pageX - canvasElement.offsetLeft,
				e.pageY - canvasElement.offsetTop
			);
		}
	}, false);
	canvasElement.addEventListener('mouseup', function(e){
		//check for intrpt
		if (mouseIsDown){
			mouseIsDown = false;
			toolstate.mouseup(
				e.pageX - canvasElement.offsetLeft,
				e.pageY - canvasElement.offsetTop
			);
		}
	}, false);
	canvasElement.addEventListener('mouseout', function(e){
		e.preventDefault();
	}, false);
}

function darkEdit(){
	buffer.temp = canvas.createImageData(canvas.width, canvas.height);
	for (var i = 0; i < buffer.active.data.length; i += 4){
		buffer.temp.data[i + 0] = buffer.active.data[i + 0];
		buffer.temp.data[i + 1] = buffer.active.data[i + 1];
		buffer.temp.data[i + 2] = buffer.active.data[i + 2];
		buffer.temp.data[i + 3] = buffer.active.data[i + 3];
	}
	var lightThresh = darkEl.lightVal;
	var darkThresh = darkEl.darkVal;
	var binNum = darkEl.binVal;

	var range = lightThresh - darkThresh;
	var binRange = range / (binNum - 2);
	var binMin = darkThresh + binRange;
	var binMax = darkThresh + Math.floor(binRange * (binNum - 2));
	var binDiv = [];
	var binVal = [];
	for (var i = 1; i <= (binNum - 2); i++){
		var temp = darkThresh + (i * binRange);
		binDiv.push(temp);
		var temp2 = i / (binNum - 2);
		temp2 = Math.floor(temp2 * 255);
		binVal.push(temp2)
	}
	for (var i = 0; i < buffer.temp.data.length; i += 4){
		var r = buffer.temp.data[i];
		var g = buffer.temp.data[i + 1];
		var b = buffer.temp.data[i + 2];
		var avg = Math.floor((r + g + b) / 3);
		if (avg <= darkThresh || avg < binMin){
			avg = 0;
		} else if (avg >= lightThresh || avg > binMax){
			avg = 255;
		} else {
			avg = darkThresh + Math.floor(avg * (range / lightThresh));
			for (var j = 0; j < binDiv.length - 1; j++){
				if (avg >= binDiv[j] && avg <= binDiv[j + 1]){
					avg = binVal[j];
					break;
				}
			}
		}
		buffer.temp.data[i] = avg;
		buffer.temp.data[i + 1] = avg;
		buffer.temp.data[i + 2] = avg;
	}
	canvas.putImageData(buffer.temp, 0, 0);
}

function rgbEdit(colorVals){
	buffer.temp = canvas.createImageData(canvas.width, canvas.height);
	for (var i = 0; i < buffer.active.data.length; i += 4){
		buffer.temp.data[i + 3] = buffer.active.data[i + 3];
	}
	var rChange;
	var gChange;
	var bChange;	
	if (colorVals == undefined){
		rChange = colorEl.rVal;
		gChange = colorEl.gVal;
		bChange = colorEl.bVal;	
	} else {
		rChange = colorVals;
		gChange = colorVals;
		bChange = colorVals;
	}
	var pR = 0.299;
	var pG = 0.587;
	var pB = 0.114;

	for (var i = 0; i < buffer.temp.data.length; i += 4){
		var r = buffer.active.data[i + 0];
		var g = buffer.active.data[i + 1];
		var b = buffer.active.data[i + 2];
		var p = Math.sqrt(r * r * pR + g * g * pG + b * b * pB);

		r = p + (r - p) * rChange;
		g = p + (g - p) * gChange;
		b = p + (b - p) * bChange;

		if (r > 255){
			buffer.temp.data[i + 0] = 255;	
		} else {
			buffer.temp.data[i + 0] = Math.floor(r);
		}
		if (g > 255){
			buffer.temp.data[i + 1] = 255;	
		} else {
			buffer.temp.data[i + 1] = Math.floor(g);
		}
		if (b > 255){
			buffer.temp.data[i + 2] = 255;	
		} else {
			buffer.temp.data[i + 2] = Math.floor(b);
		}
	}
	canvas.putImageData(buffer.temp, 0, 0);

}

function levelsEdit(){
	buffer.temp = canvas.createImageData(canvas.width, canvas.height);
	for (var i = 0; i < buffer.active.data.length; i += 4){
		buffer.temp.data[i + 3] = buffer.active.data[i + 3];
	}
	
	var range = levelsEl.hiVal - levelsEl.loVal;

	for (var i = 0; i < buffer.active.data.length; i += 4){
		var r = buffer.active.data[i + 0];
		var g = buffer.active.data[i + 1];
		var b = buffer.active.data[i + 2];
		
		r = levelsEl.loVal + ( (r - levelsEl.loVal) / range) * 255;
		g = levelsEl.loVal + ( (g - levelsEl.loVal) / range) * 255;
		b = levelsEl.loVal + ( (b - levelsEl.loVal) / range) * 255;

		if (r > 255){
			buffer.temp.data[i + 0] = 255;	
		} else if (r < 0) 
			buffer.temp.data[i + 0] = 0;
		else {
			buffer.temp.data[i + 0] = Math.floor(r);
		}
		if (g > 255){
			buffer.temp.data[i + 1] = 255;	
		} else if (g < 0){
			buffer.temp.data[i + 1] = 0;	
		} 
		else {
			buffer.temp.data[i + 1] = Math.floor(g);
		}
		if (b > 255){
			buffer.temp.data[i + 2] = 255;	
		} else if (b < 0){
			buffer.temp.data[i + 2] = 0;
		}else {
			buffer.temp.data[i + 2] = Math.floor(b);
		}
		
	}
	canvas.putImageData(buffer.temp, 0, 0);
}


function channelLevelsEdit(){
	buffer.temp = canvas.createImageData(canvas.width, canvas.height);
	for (var i = 0; i < buffer.active.data.length; i += 4){
		buffer.temp.data[i + 3] = buffer.active.data[i + 3];
	}

	var rRange = channelLevelsEl.rHiVal - channelLevelsEl.rLoVal;
	var gRange = channelLevelsEl.gHiVal - channelLevelsEl.gLoVal;
	var bRange = channelLevelsEl.bHiVal - channelLevelsEl.bLoVal;

	for (var i = 0; i < buffer.active.data.length; i += 4){
		var r = buffer.active.data[i + 0];
		var g = buffer.active.data[i + 1];
		var b = buffer.active.data[i + 2];
		
		r = channelLevelsEl.rLoVal + ( (r - channelLevelsEl.rLoVal) / rRange) * 255;
		g = channelLevelsEl.gLoVal + ( (g - channelLevelsEl.gLoVal) / gRange) * 255;
		b = channelLevelsEl.bLoVal + ( (b - channelLevelsEl.bLoVal) / bRange) * 255;

		if (r > 255){
			buffer.temp.data[i + 0] = 255;	
		} else if (r < 0) 
			buffer.temp.data[i + 0] = 0;
		else {
			buffer.temp.data[i + 0] = Math.floor(r);
		}
		if (g > 255){
			buffer.temp.data[i + 1] = 255;	
		} else if (g < 0){
			buffer.temp.data[i + 1] = 0;	
		} 
		else {
			buffer.temp.data[i + 1] = Math.floor(g);
		}
		if (b > 255){
			buffer.temp.data[i + 2] = 255;	
		} else if (b < 0){
			buffer.temp.data[i + 2] = 0;
		}else {
			buffer.temp.data[i + 2] = Math.floor(b);
		}
		
	}
	canvas.putImageData(buffer.temp, 0, 0);
}

function Tool(name, action, optional){
	this.name = name;
	this.process = action;
	this.optional = optional;
}

function ToolStateSystem(toolList, canvas){
	this.activeState = null;
	this.toolElements = {};
	this.registerListeners(this, toolList);
	this.startX;
	this.startY;
	this.endX;
	this.endY;
	this.twoPi = 2 * Math.PI;

	this.line = new Tool('line', function(startX, startY, endX, endY, isRender){
		activeRender();
		canvas.beginPath();
		canvas.moveTo(startX, startY);
		canvas.lineTo(endX, endY);
		canvas.stroke();
		//print to image
		if (isRender){
			buffer.active = canvas.getImageData(0, 0, canvas.width, canvas.height);
			activeRender();
			swapBuffers();
			isIntrpt = false;
		}
	});

	this.circle = new Tool('circle', function(startX, startY, endX, endY, isRender){
		activeRender();

		var centerX = startX + ((endX - startX) / 2);
		var centerY = startY + ((endY - startY) / 2);
		var radius;

		if (endX - startX > 0 && endY - startY > 0){
			if ( (endX - startX) > (endY - startY) ){
				//if wider
				radius = Math.abs((endY - startY) / 2);
			} else {
				//if taller
				radius = Math.abs((endX - startX) / 2);
			}	
		} else {
			if ( (endX - startX) > (endY - startY) ){
				//if wider
				radius = Math.abs((endX - startX) / 2);
			} else {
				//if taller
				radius = Math.abs((endY - startY) / 2);
			}	
		}

		canvas.strokeStyle = '#990000';
		canvas.lineWidth = 1;

		if (!isRender){
			//draw bounding box
			//top
			canvas.beginPath();
			canvas.moveTo(startX, startY);
			canvas.lineTo(endX, startY);
			canvas.stroke();
		
			//left
			canvas.beginPath();
			canvas.moveTo(startX, startY);
			canvas.lineTo(startX, endY);
			canvas.stroke();

			//right
			canvas.beginPath();
			canvas.moveTo(endX, startY);
			canvas.lineTo(endX, endY);
			canvas.stroke();

			//bottom
			canvas.beginPath();
			canvas.moveTo(startX, endY);
			canvas.lineTo(endX, endY);
			canvas.stroke();
		}
		
		if (isFill){
			canvas.fillStyle = getFillColor();
			canvas.beginPath();
			canvas.arc(centerX, centerY, radius, 0, twoPi);
			canvas.fill();
		}

		if (isStroke){
			canvas.strokeStyle = getStrokeColor();
			canvas.lineWidth = strokeWidth;
			canvas.beginPath();
			canvas.arc(centerX, centerY, radius, 0, twoPi);
			canvas.stroke();
		}

		//print to image
		//print to image
		if (isRender && (isStroke || isFill)){
			buffer.active = canvas.getImageData(0, 0, canvas.width, canvas.height);
			activeRender();
			swapBuffers();
		}
	});

	this.pen = new Tool('pen', function(startX, startY, endX, endY, isRender){
		activeRender();

		penPoints.push({
			x: endX,
			y: endY
		});

		canvas.beginPath();
		canvas.moveTo(penPoints[0].x, penPoints[0].y);
		for (var i = 0; i < penPoints.length - 1; i++){
			canvas.lineTo(penPoints[i].x, penPoints[i].y);
			canvas.moveTo(penPoints[i].x, penPoints[i].y);
		}
		canvas.stroke();
		//print to image
		if (isRender){
			buffer.active = canvas.getImageData(0, 0, canvas.width, canvas.height);
			activeRender();
			swapBuffers();
			isIntrpt = false;
			penPoints = [];
		}
	});

	this.brush = new Tool('brush', function(startX, startY, endX, endY, isRender){
		activeRender();

		canvas.beginPath();
		canvas.arc(endX, endY, strokeWidth, 0, twoPi);
		canvas.fill();

		buffer.active = canvas.getImageData(0, 0, canvas.width, canvas.height);
		activeRender();
		swapBuffers();
		isIntrpt = false;
	});

	this.fill = new Tool('fill', function(startX, startY, endX, endY, isRender){
		buffer.active = canvas.getImageData(0, 0, canvas.width, canvas.height);
		var startIndex = (startY * canvas.width + startX) * 4;
		fillTarget.r = buffer.active.data[startIndex];
		fillTarget.g = buffer.active.data[startIndex + 1];
		fillTarget.b = buffer.active.data[startIndex + 2];

		var pixelStack = [[startX, startY]];
		var fillCnt = 0;
		var startTime = new Date();
		var cnt = 0;

		while(pixelStack.length > 0) {
			if (cnt++ % 100 == 0){
				if (new Date() - startTime > 1000){
					break;
				}
			}
  			var newPos, x, y, pixelPos, reachLeft, reachRight;
  			newPos = pixelStack.pop();
  			x = newPos[0];
  			y = newPos[1];
  
  			pixelPos = (y * canvas.width + x) * 4;
  			while(y-- >= 0 && this.optional(pixelPos)){
    			pixelPos -= canvas.width * 4;
  			}
  			pixelPos += canvas.width * 4;
  			y++;
  			reachLeft = false;
  			reachRight = false;
  			while(y++ < canvas.height - 1 && this.optional(pixelPos)){
    			buffer.active.data[pixelPos + 0] = parseInt(fill.r);
 				buffer.active.data[pixelPos + 1] = parseInt(fill.g);
 				buffer.active.data[pixelPos + 2] = parseInt(fill.b);
 				buffer.active.data[pixelPos + 3] = 255;
 				fillCnt++;

    			if(x > 0){
      				if(this.optional(pixelPos - 4)){
        				if(!reachLeft){
          					pixelStack.push([x - 1, y]);
          					reachLeft = true;
        				}
      				}
      			}
      			else if(reachLeft) {
       				reachLeft = false;
      			}

      			if(x < canvas.width - 1) {
      				if(this.optional(pixelPos + 4)){
       					if(!reachRight){
          					pixelStack.push([x + 1, y]);
          					reachRight = true;
        				}
      				}
      				else if(reachRight) {
        				reachRight = false;
      				}
      				pixelPos += canvas.width * 4;
    			}

   			}
	
  		}
		activeRender();
		swapBuffers();
		isIntrpt = false;
	
	}, function (targetInd){
		var activeSum = parseInt(fillTarget.r) + parseInt(fillTarget.g) + parseInt(fillTarget.b);
		var targetSum = buffer.active.data[targetInd] + buffer.active.data[targetInd + 1] + buffer.active.data[targetInd + 2];
		if (Math.abs(activeSum - targetSum) < fillThresh.val){
			return true;
		} else {
			return false;
		}
	});

	this.bez3 = new Tool('bez3', function(startX, startY, endX, endY, isRender, mouseIsMove){
		activeRender();

		if (!isRender && !mouseIsMove){
			//new point
			bez3Points.push({
				x: startX,
				y: startY
			});
		}
		if (mouseIsMove){
			//move latest point
			bez3Points[bez3Points.length - 1].x = endX,
			bez3Points[bez3Points.length - 1].y = endY
		}
		

		canvas.strokeStyle = '#ff0000';
		canvas.fillStyle = '#00ff00';
		canvas.lineWidth = 3;

		//render construct lines
		canvas.beginPath();
		for (var i = 0; i < bez3Points.length; i++){
			canvas.lineTo(bez3Points[i].x, bez3Points[i].y);
			canvas.moveTo(bez3Points[i].x, bez3Points[i].y);
		}
		canvas.stroke();

		//render construct dots
		for (var i = 0; i < bez3Points.length; i++){
			canvas.beginPath();
			canvas.arc(bez3Points[i].x, bez3Points[i].y, 10, 0, twoPi);
			canvas.fill();
		}

		canvas.fillStyle = getFillColor();
		canvas.strokeStyle = getStrokeColor();
		canvas.lineWidth = strokeWidth;

	if (bez3Points.length == 3){
			if (isRender){
				activeRender();
			}
			

			//render curve
			canvas.beginPath();
			canvas.moveTo(bez3Points[0].x, bez3Points[0].y);
			canvas.bezierCurveTo(
				bez3Points[0].x, bez3Points[0].y,
				bez3Points[1].x, bez3Points[1].y,
				bez3Points[2].x, bez3Points[2].y
			);
			canvas.stroke();
			if (isRender){
				buffer.active = canvas.getImageData(0, 0, canvas.width, canvas.height);
				activeRender();
				swapBuffers();
				isIntrpt = false;
				bez3Points = [];
			}
		}

		
	});

	this.rect = new Tool('rect', function(startX, startY, endX, endY, isRender, mouseIsMove){
		activeRender();

		if (isFill){
			canvas.fillRect(startX, startY, endX - startX, endY - startY);
		}
		if (isStroke){
			canvas.strokeRect(startX, startY, endX - startX, endY - startY);
		}

		//print to image
		if (isRender && (isStroke || isFill)){
			buffer.active = canvas.getImageData(0, 0, canvas.width, canvas.height);
			activeRender();
			swapBuffers();
			isIntrpt = false;
		}
	});

	this.setStroke = new Tool('setStroke', function(startX, startY, endX, endY, isRender){
		if (isRender){
			var temp = canvas.getImageData(endX, endY, 1, 1);
			var r = temp.data[0];
			var g = temp.data[1];
			var b = temp.data[2];
			var a = temp.data[3];
			setStrokeColor(r, g, b, a);
			canvas.strokeStyle = getStrokeColor();
			strokeEl.disp.style.cssText = 'background: ' + getStrokeColor();
			strokePickerElement.style.cssText = 'background: ' + getStrokeColor();
			strokeEl.rIn.value = r;
			strokeEl.rOut.innerHTML = r;
			strokeEl.gIn.value = g;
			strokeEl.gOut.innerHTML = g;
			strokeEl.bIn.value = b;
			strokeEl.bOut.innerHTML = b;
			strokeEl.aIn.value = a;
			strokeEl.aOut.innerHTML = a;
		}
	});

	this.setFill = new Tool('setFill', function(startX, startY, endX, endY, isRender){
		if (isRender){
			var temp = canvas.getImageData(endX, endY, 1, 1);
			var r = temp.data[0];
			var g = temp.data[1];
			var b = temp.data[2];
			var a = temp.data[3];
			setFillColor(r, g, b, a);
			canvas.FillStyle = getFillColor();
			fillEl.disp.style.cssText = 'background: ' + getFillColor();
			fillPickerElement.style.cssText = 'background: ' + getFillColor();
			fillEl.rIn.value = r;
			fillEl.rOut.innerHTML = r;
			fillEl.gIn.value = g;
			fillEl.gOut.innerHTML = g;
			fillEl.bIn.value = b;
			fillEl.bOut.innerHTML = b;
			fillEl.aIn.value = a;
			fillEl.aOut.innerHTML = a;
		}
	});
	
}

ToolStateSystem.prototype.registerListeners = function(obj, toolList){
	for (var i = 0; i < toolList.length; i++){
		obj.toolElements[toolList[i]] = document.getElementById(toolList[i]);
		obj.toolElements[toolList[i]].addEventListener('click', function(e){
			e.preventDefault();
			obj.setActiveTool(e.target.id);
		}, false);
		
	}
}

ToolStateSystem.prototype.setActiveTool = function(activeTool){
	this.activeState = activeTool;
	for (var tool in this.toolElements){
		if (tool != activeTool){
			this.toolElements[tool].style.background = '#ffffff';
		} else {
			this.toolElements[tool].style.background = '#44cccc';
		}
		if (activeTool == 'fill'){
			fillThresh.div.style.cssText = 'display: block';
		} else {
			fillThresh.div.style.cssText = 'display: none';
		}
		if (activeTool == 'line' || activeTool == 'circle' || activeTool == 'pen' || activeTool == 'brush' || activeTool == 'bez3' || activeTool == 'rect'){
			strokeEl.strokeWidthDiv.style.cssText = 'display: block';
			strokeEl.strokeStyleDiv.style.cssText = 'display: block';
		} else {
			strokeEl.strokeWidthDiv.style.cssText = 'display: none';
			strokeEl.strokeStyleDiv.style.cssText = 'display: none';
		}
	}
}

ToolStateSystem.prototype.process = function(bool, md){
	this[this.activeState].process(this.startX, this.startY, this.endX, this.endY, bool, md);
}	

ToolStateSystem.prototype.mousedown = function(x, y){
	this.startX = x;
	this.startY = y;
	if (this.activeState == 'pen'){
		penPoints.push({
			x: x,
			y: y
		});
	}
	else if (this.activeState == 'brush'){
		this.endX = x;
		this.endY = y;
		this.process();
	}
	else if (this.activeState == 'fill' || this.activeState == 'bez3' || this.activeState == 'bez4'){
		this.process();
	}
}

ToolStateSystem.prototype.mousemove = function(x, y){
	if (this.activeState == 'fill'){
		return;
	}
	this.endX = x;
	this.endY = y;
	this.process(false, true);
}

ToolStateSystem.prototype.mouseup = function(x, y){
	if (this.activeState == 'fill'){
		return;
	}
	this.endX = x;
	this.endY = y;
	this.process(true, false);
}

function Buffer(len){
	this.len = len;
	this.arr = new Array(len);
	this.activeIndex = 0;
	this.head = 0;
	this.cnt = 0;
}

Buffer.prototype.print = function(){
	var tempString = this.arr[0];
	for (var i = 1; i < this.arr.length; i++){
		tempString += ', ' + this.arr[i];
	}
}

Buffer.prototype.add = function(data){
	this.activeIndex = (this.activeIndex + 1) % this.len;
	this.head = this.activeIndex;
	this.arr[this.activeIndex] = data;
	if(this.cnt < this.len - 1){
		this.cnt++;
	}
	this.print();
}

Buffer.prototype.undo = function(){
	if (this.cnt <= 0){
		alert('no undos left!');
		return false;
	}
	this.activeIndex = (this.activeIndex - 1) % this.len;
	if (this.activeIndex < 0){
		this.activeIndex = this.len - 1;
	}
	this.cnt--;
	this.print();
	return true;
}

Buffer.prototype.redo = function(){
	if (this.activeIndex == this.head){
		alert('no redos left!');
		return false;
	}
	this.activeIndex = (this.activeIndex + 1) % this.len;
	this.cnt++;
	this.print();
	return true;
}

Buffer.prototype.getActiveData = function(){
	return this.arr[this.activeIndex];
}

Buffer.prototype.reset = function(data){
	this.activeIndex = 0;
	this.head = 0;
	this.cnt = 0;
	for (var i = 0; i < this.len; i++){
		this.arr[i] = data;
	}
}

function Draggable(elementHeader, element, actX, actY){
	this.element = element;
	this.elementHeader = elementHeader;
	this.mouseIsDown = false;
	this.lastPos = {
		x: 0,
		y: 0
	};
	this.thisPos = {
		x: 0,
		y: 0
	};
	this.actualPos = {
		x: actX,
		y: actY
	};
	this.element.style.left = this.actualPos.x + 'px';
	this.element.style.top = this.actualPos.y + 'px';
	this.registerListeners(this);
}

Draggable.prototype.registerListeners = function(obj){
	
	obj.elementHeader.addEventListener('mousedown', function(e){
		e.preventDefault();
		obj.lastPos.x = parseInt(e.pageX);
		obj.lastPos.y = parseInt(e.pageY);
		obj.thisPos.x = parseInt(e.pageX);
		obj.thisPos.y = parseInt(e.pageY);
		obj.mouseIsDown = true;
	}, false);

	obj.elementHeader.addEventListener('mousemove', function(e){
		e.preventDefault();
		if (obj.mouseIsDown){
			obj.lastPos.x = obj.thisPos.x;
			obj.lastPos.y = obj.thisPos.y;
			obj.thisPos.x = e.pageX;
			obj.thisPos.y = e.pageY;
			obj.moveElementPosition(obj.thisPos.x - obj.lastPos.x, obj.thisPos.y - obj.lastPos.y);
		}
	}, false);

	obj.elementHeader.addEventListener('mouseup', function(e){
		e.preventDefault();
		obj.mouseIsDown = false;
	}, false);

	obj.elementHeader.addEventListener('mouseout', function(e){
		e.preventDefault();
		obj.mouseIsDown = false;
	}, false);

}

Draggable.prototype.moveElementPosition = function(x, y){
	this.actualPos.x += x;
	this.actualPos.y += y;
	this.element.style.left = this.actualPos.x + "px";
	this.element.style.top = this.actualPos.y + "px";
}