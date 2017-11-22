"use strict";

const PIXELS = "px";
const EXACT_MATCH_TEXT = "exact match";

const CHARACTERS_REQUIRED_BEFORE_SEARCHING = 2;
const SEARCH_RESULTS_TO_DISPLAY = 10;

const MAX_DISTANCE = 441.67;

const COLOR_SWATCH_HEIGHT = 50 + PIXELS;
const COLOR_SWATCH_MARGIN = 4 + PIXELS;
const COLOR_SWATCH_PADDING = 15 + PIXELS;

const INPUT_CHAR_WIDTH_PIXELS = 15;

const STOP_WORDS = ["and", "but", "the"];

var colorSwatchDiv;

function anyColorSelectionChange(newColorHex, newColorRgb) {
    document.getElementsByTagName("body")[0].style.backgroundColor = newColorHex;
    document.getElementById("lowerDiv").style.color = readableColorForBackground(newColorHex);
    var elementsWithDynamicColor = document.getElementsByClassName("dynamicColor");
    for (var i = 0; i < elementsWithDynamicColor.length; i++) {
        elementsWithDynamicColor.item(i).style.color = newColorHex;
    }

    updateRgbText(newColorRgb);

    colorSwatchDiv.innerHTML = "";
}

function chooseColorWithoutPicker(chosenColor) {
    document.getElementById("colorPicker").jscolor.fromString(chosenColor);
    chooseColor(chosenColor);
}

function chooseColor(chosenColor) {
    var chosenColorRgb = hexToRgb(chosenColor);
    anyColorSelectionChange(chosenColor, chosenColorRgb);

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
            addSwatchToDiv(approxColorHex, names[j] + "  ~  <i>" + nearnessText + "</i>");
        }
    }
}

function rgbDistTupleComparator(c0, c1) {
    if (c0[1] < c1[1]) return -1;
    if (c0[1] > c1[1]) return 1;
    return 0;
}

function searchForColor(searchText) {

    if (searchText == null || searchText.length < CHARACTERS_REQUIRED_BEFORE_SEARCHING) {
        return;
    }

    var pq = new FastPriorityQueue(function(a,b) {return a.score > b.score});;
    var searchTextSplit = searchText.trim().toLowerCase().split(" ");
    for (var colorName in colorGlossaryReverse) {
        var score = 0;
        var colorNameSplit = colorName.toLowerCase().split(" ");
        for (var i=0; i<searchTextSplit.length; i++) {
            var searchWord = searchTextSplit[i];
            var flex = 0;
            for (var j=0; j<colorNameSplit.length; j++) {
                var colorNameWord = colorNameSplit[j];
                var isStopWord = colorNameWord.length < 3 || STOP_WORDS.indexOf(colorNameWord) !== -1;
                var indexOfSearchTerm = colorNameWord.indexOf(searchWord);

                if (indexOfSearchTerm !== -1) {
                    score += searchWord.length;
                    if (i >= j - flex && i <= j) {
                        score += 3;
                    }
                    if (indexOfSearchTerm == 0) {
                        score += 6;
                    }
                    var termLengthDifference = colorNameWord.length - indexOfSearchTerm.length;
                    if (termLengthDifference < 3) {
                        score += (4 - termLengthDifference);
                    }
                } else if (!isStopWord) {
                    score--;
                }

                if (isStopWord) {
                    flex++;
                }
            }
        }

        if (score > 0) {
            pq.add({name: colorName, score: score});
        }
    }

    if (pq.isEmpty()) {
        colorSwatchDiv.innerHTML = "<br><center><h1><b>No results!</b></h1></center>";
        return;
    }

    var chosenColorHex = colorGlossaryReverse[pq.peek().name];
    document.getElementById("colorPicker").jscolor.fromString(chosenColorHex);
    anyColorSelectionChange(chosenColorHex, hexToRgb(chosenColorHex));

    // Add swatches of search results
    var swatchesAdded = 0;
    while (!pq.isEmpty() && swatchesAdded < SEARCH_RESULTS_TO_DISPLAY) {
        var result = pq.poll();
        var hexColor = colorGlossaryReverse[result.name];
        addSwatchToDiv(hexColor, result.name + " ~ " + result.score);
        swatchesAdded++;
    }
}

function addSwatchToDiv(hexColor, text) {
    var div = document.createElement("div");
    div.style.height = COLOR_SWATCH_HEIGHT;
    div.style.margin = COLOR_SWATCH_MARGIN;
    div.style.padding = COLOR_SWATCH_PADDING;
    div.style.backgroundColor = hexColor;
    div.hexColor = hexColor;
    div.style.color = readableColorForBackground(hexColor);
    div.innerHTML = text;
    div.style.border = "1px dashed " + hexColor;

    div.onmouseover = function() {
        this.style.border = "1px dashed " + readableColorForBackground(rgbStringToHex(this.style.backgroundColor));
    }

    div.onmouseleave = function() {
        this.style.border = "1px dashed " + rgbStringToHex(this.style.backgroundColor);
    }

    div.onclick = function() {
        chooseColorWithoutPicker(rgbStringToHex(this.style.backgroundColor));
    }
    colorSwatchDiv.appendChild(div);
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

function updateRgbText(newRgbColor) {
    document.getElementById("red").value = newRgbColor.r;
    document.getElementById("green").value = newRgbColor.g;
    document.getElementById("blue").value = newRgbColor.b;
    updateRgbInputSize("red");
    updateRgbInputSize("green");
    updateRgbInputSize("blue");
}

function updateRgbInputSize(inputName) {
    var colorComponent = document.getElementById(inputName).value;
    document.getElementById(inputName).style.width = (numDigits(colorComponent) * INPUT_CHAR_WIDTH_PIXELS) + PIXELS;    
}

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

window.onload = function() {
    colorSwatchDiv = document.getElementById("lowerDivRight")
    chooseColorWithoutPicker(randomHexColor());
    document.getElementById("colorPicker").jscolor.show();
}