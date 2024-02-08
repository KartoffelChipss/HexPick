const mainColorBox = document.getElementById("mainColorBox");

window.api.invoke("getLastColors");

function pickColor() {
    window.api.invoke('startPicking');
}

window.bridge.pickedColor((event, color) => {
    const rgbColor = hexToRgb(color);

    mainColorBox.querySelector(".hexinput input").value = color;
    mainColorBox.querySelector(".hexinput .color").style.setProperty("--box-color", color);

    mainColorBox.querySelector(".rgb input.r").value = rgbColor.r;
    mainColorBox.querySelector(".rgb input.g").value = rgbColor.g;
    mainColorBox.querySelector(".rgb input.b").value = rgbColor.b;
});

window.bridge.updateLastColors((event, colors) => {
    const lastColors = document.querySelector(".lastColors");

    colors.forEach((color, i) => {
        const colorBox = lastColors.querySelectorAll(".colorBox")[i];

        console.log(colorBox)

        if (!colorBox) return;

        const rgbColor = hexToRgb(color);

        colorBox.querySelector(".hexinput input").value = color;
        colorBox.querySelector(".hexinput .color").style.setProperty("--box-color", color);

        colorBox.querySelector(".rgb input.r").value = rgbColor.r;
        colorBox.querySelector(".rgb input.g").value = rgbColor.g;
        colorBox.querySelector(".rgb input.b").value = rgbColor.b;
    });
});

function hexToRgb(hex) {
    hex = hex.replace('#', '');

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

window.api.invoke("getVersion");

window.bridge.sendVersion((event, version) => {
    document.getElementById("version").innerText = `v${version}`;
});