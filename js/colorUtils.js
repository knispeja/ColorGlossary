"use strict";

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function rgbObjToHex(rgb) {
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function rgbStringToHex(rgbStr) {
    var rgb = rgbStr.split( ',' ) ;
    var r = parseInt(rgb[0].substring(4)) ;
    var g = parseInt(rgb[1]) ;
    var b = parseInt(rgb[2]) ;
    return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function readableColorForBackground(hex) {
    var color = hexToRgb(hex);
    if(0.213 * color.r + 0.715 * color.g + 0.072 * color.b > 255 / 2) {
        return "#000000";
    }
    return "#ffffff";
}

function numDigits(x) {
    return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
}