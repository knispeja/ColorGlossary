"use strict";

const MAX_DISTANCE = 441.67;

function rgbDistTupleComparator(c0, c1) {
    if (c0[1] < c1[1]) return -1;
    if (c0[1] > c1[1]) return 1;
    return 0;
}

function chooseColor(chosenColor) {
    document.getElementsByTagName("body")[0].style.backgroundColor = chosenColor;
    var colorNameDiv = document.getElementById("lowerDivRight");
    colorNameDiv.innerHTML = "";

    var chosenColorRgb = hexToRgb(chosenColor);
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
        var nearnessText = colorDist == 0 ? "exact match" : percentSimilarity + "% similar"

        for (var j = 0; j < names.length; j++) {
            var div = document.createElement("div");
            div.style.height = "50px";
            div.style.width = "250px";
            div.style.margin = "4px";
            div.style.padding = "15px";
            div.style.backgroundColor = approxColorHex;
            div.hexColor = approxColorHex;
            div.style.color = readableColorForBackground(approxColorHex);
            div.innerHTML = names[j] + " -- <i>" + nearnessText + "</i>";
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