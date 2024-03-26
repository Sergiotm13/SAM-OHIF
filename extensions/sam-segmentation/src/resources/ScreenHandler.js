export const handleResize = () => {
    const otherCanvasStyle = window.getComputedStyle(
        document.getElementById("other_canvas")
    );
    const loadedImage = document.getElementById("loaded_image");

    if (loadedImage) {
        loadedImage.style.top = otherCanvasStyle.getPropertyValue("top");
        loadedImage.style.bottom = otherCanvasStyle.getPropertyValue("bottom");
        loadedImage.style.left = otherCanvasStyle.getPropertyValue("left");
        loadedImage.style.right = otherCanvasStyle.getPropertyValue("right");
        loadedImage.style.width = otherCanvasStyle.getPropertyValue("width");
        loadedImage.style.height = otherCanvasStyle.getPropertyValue("height");
    }
};