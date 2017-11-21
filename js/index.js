"use strict";

const PIXELS = "px";
const EXACT_MATCH_TEXT = "exact match";

const MAX_DISTANCE = 441.67;

const COLOR_SWATCH_HEIGHT = 50 + PIXELS;
const COLOR_SWATCH_MARGIN = 4 + PIXELS;
const COLOR_SWATCH_PADDING = 15 + PIXELS;

const INPUT_CHAR_WIDTH_PIXELS = 15;

function chooseColorWithoutPicker(chosenColor) {
    document.getElementById("colorPicker").jscolor.fromString(chosenColor);
    chooseColor(chosenColor);
}

function chooseColor(chosenColor) {
    document.getElementsByTagName("body")[0].style.backgroundColor = chosenColor;
    var elementsWithDynamicColor = document.getElementsByClassName("dynamicColor");
    for(var i = 0; i < elementsWithDynamicColor.length; i++) {
        elementsWithDynamicColor.item(i).style.color = chosenColor;
    }

    var colorNameDiv = document.getElementById("lowerDivRight");
    colorNameDiv.innerHTML = "";

    var chosenColorRgb = hexToRgb(chosenColor);
    
    // Set RGB text
    document.getElementById("red").value = chosenColorRgb.r;
    document.getElementById("green").value = chosenColorRgb.g;
    document.getElementById("blue").value = chosenColorRgb.b;
    updateRgbInputSize("red");
    updateRgbInputSize("green");
    updateRgbInputSize("blue");
    var nearestColors = colorProximityTree.nearest(chosenColorRgb, 5);

    for (var i = 0; i < nearestColors.length; i++) {
        var approxColorRgb = nearestColors[i][0];
        var approxColorDist = Math.pow(chosenColorRgb.r - approxColorRgb.r, 2) +
                                Math.pow(chosenColorRgb.g - approxColorRgb.g, 2) +
                                Math.pow(chosenColorRgb.b - approxColorRgb.b, 2);
        nearestColors[i][1] = approxColorDist;
    }

    nearestColors.sort(rgbDistTupleComparator);

    for (var i = 0; i < nearestColors.length; i++) {
        var approxColorRgb = nearestColors[i][0];
        var colorDist = nearestColors[i][1];
        var approxColorHex = rgbToHex(approxColorRgb.r, approxColorRgb.g, approxColorRgb.b);
        
        var names = colorGlossary[approxColorHex];

        var percentSimilarity = Math.floor(100 - colorDist/MAX_DISTANCE);
        var nearnessText = colorDist == 0 ? EXACT_MATCH_TEXT : percentSimilarity + "% similar"

        for (var j = 0; j < names.length; j++) {
            var div = document.createElement("div");
            div.style.height = COLOR_SWATCH_HEIGHT;
            div.style.margin = COLOR_SWATCH_MARGIN;
            div.style.padding = COLOR_SWATCH_PADDING;
            div.style.backgroundColor = approxColorHex;
            div.hexColor = approxColorHex;
            div.style.color = readableColorForBackground(approxColorHex);
            div.innerHTML = names[j] + "  ~  <i>" + nearnessText + "</i>";
            div.style.border = "1px dashed " + approxColorHex;

            div.onmouseover = function() {
                this.style.border = "1px dashed " + readableColorForBackground(rgbStringToHex(this.style.backgroundColor));
            }

            div.onmouseleave = function() {
                this.style.border = "1px dashed " + rgbStringToHex(this.style.backgroundColor);
            }

            div.onclick = function() {
                document.getElementById("colorPicker").jscolor.fromString(this.style.backgroundColor);
                chooseColor(rgbStringToHex(this.style.backgroundColor));
            }
            colorNameDiv.appendChild(div);
        }
    }
}

function rgbDistTupleComparator(c0, c1) {
    if (c0[1] < c1[1]) return -1;
    if (c0[1] > c1[1]) return 1;
    return 0;
}

function rgbInputChange() {
    var r = parseInt(document.getElementById("red").value);
    var g = parseInt(document.getElementById("green").value);
    var b = parseInt(document.getElementById("blue").value);

    r = isNaN(r) ? 0 : r;
    r = r > 255 ? 255 : r;

    g = isNaN(g) ? 0 : g;
    g = g > 255 ? 255 : g;

    b = isNaN(b) ? 0 : b;
    b = b > 255 ? 255 : b;

    chooseColorWithoutPicker(rgbToHex(r, g, b));
}

function updateRgbInputSize(inputName) {
    var colorComponent = document.getElementById(inputName).value;
    document.getElementById(inputName).style.width = (numDigits(colorComponent) * INPUT_CHAR_WIDTH_PIXELS) + PIXELS;    
}

window.onload = function() {
    chooseColorWithoutPicker(randomHexColor());
}