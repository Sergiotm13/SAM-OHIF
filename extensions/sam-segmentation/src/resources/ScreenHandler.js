export const handleResize = () => {
  const canvas = document.getElementById('canvas');
  const captured_canvas = document.getElementById('captured_canvas');
  canvas.style.width = '100%';

  const otherCanvasStyle = window.getComputedStyle(captured_canvas);
  const loadedImage = document.getElementById('loaded_image');

  if (loadedImage) {
    loadedImage.style.top = otherCanvasStyle.getPropertyValue('top');
    loadedImage.style.bottom = otherCanvasStyle.getPropertyValue('bottom');
    loadedImage.style.left = otherCanvasStyle.getPropertyValue('left');
    loadedImage.style.right = otherCanvasStyle.getPropertyValue('right');
    loadedImage.style.width = otherCanvasStyle.getPropertyValue('width');
    loadedImage.style.height = otherCanvasStyle.getPropertyValue('height');
  }
};
