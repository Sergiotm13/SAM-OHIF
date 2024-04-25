import { useState, useRef, useEffect } from 'react';
import '../styles/ImageContainer.css';
import { drawImage } from '../resources/ImageCharging';
import React from 'react';
import { Point, type Box } from '../types/types';
import { POSITIVE_POINT_COLOR, NEGATIVE_POINT_COLOR, BOX_COLOR } from '../resources/const';
import { handleResize } from '../resources/ScreenHandler';

export default function ImageContainer({
  selectedOption,
  servicesManager,
  rectangles,
  setRectangles,
  positivePoints,
  setPositivePoints,
  negativePoints,
  setNegativePoints,
  imageSrc,
  setImageSrc,
}) {
  const { viewportGridService } = servicesManager.services;

  const canvasRef = useRef(null);
  const canvasRef0 = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const [scaleX, setScaleX] = useState<number>();
  const [scaleY, setScaleY] = useState<number>();

  const canvasOffSetX = useRef(null);
  const canvasOffSetY = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);

  window.onresize = handleResize;

  const addRectangle = (newRectangle: Box) => {
    setRectangles(prevRectangles => {
      const updatedRectangles = [...prevRectangles, newRectangle];
      return updatedRectangles;
    });
  };

  const addPoint = (newPoint: Point) => {
    if (selectedOption === 0) {
      setNegativePoints(prevPoints => {
        const updatedPoints = [...prevPoints, newPoint];
        return updatedPoints;
      });
    } else {
      setPositivePoints(prevPoints => {
        const updatedPoints = [...prevPoints, newPoint];
        return updatedPoints;
      });
    }
  };

  useEffect(() => {
    if (!(imageSrc && selectedOption === 2)) {
      setIsDrawing(false);
    }
  }, [isDrawing]);

  const eraseScreen = () => {
    setRectangles([]);
    setPositivePoints([]);
    setNegativePoints([]);
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => {
    if (selectedOption === 3) {
      eraseScreen();
    }
  }, [selectedOption]);

  useEffect(() => {
    drawImage(imageSrc, canvasRef0);
    handleResize();
    setVars();
  }, [imageSrc]);

  const setVars = () => {
    const canvas = canvasRef.current;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    contextRef.current = context;

    const canvasOffSet = canvas.getBoundingClientRect();
    canvasOffSetY.current = canvasOffSet.top;
    canvasOffSetX.current = canvasOffSet.left;

    setScaleX(canvas.width / canvasOffSet.width);
    setScaleY(canvas.height / canvasOffSet.height);
  };

  const capture_image = () => {
    // Obtener el id del viewport activo
    const active_viewport_id = viewportGridService.getActiveViewportId();

    // Obtengo el estado general de los viewports, para sacarlos todos
    const viewport_state = viewportGridService.getState();
    const viewports = viewport_state.viewports;

    // Sabiendolos todos, saco el índice del viewport activo
    let active_viewport_index = 0;
    const viewportsArray = Array.from(viewports);
    for (let i = 0; i < viewportsArray.length; i++) {
      if (viewportsArray[i][0] === active_viewport_id) {
        active_viewport_index = i;
        break;
      }
    }

    const canvas = document.getElementsByClassName('cornerstone-canvas')[
      active_viewport_index
    ] as HTMLCanvasElement;

    if (!canvas) {
      return;
    }
    if (canvas.toDataURL('image/png') === imageSrc) {
      eraseScreen();
      return;
    }
    // Obtener las dimensiones de la imagen
    const imageWidth = canvas.width;
    const imageHeight = canvas.height;

    // Establecer las dimensiones de los elementos canvas, loaded_image y captured_canvas
    const loadedImage = document.getElementById('loaded_image') as HTMLCanvasElement;
    const otherCanvas = document.getElementById('captured_canvas') as HTMLCanvasElement;

    if (loadedImage) {
      loadedImage.width = imageWidth;
      loadedImage.height = imageHeight;
    }

    if (otherCanvas) {
      otherCanvas.width = imageWidth;
      otherCanvas.height = imageHeight;
    }

    // Como habrá una nueva imagen, borro los rectángulos y los puntos de la anterior
    setRectangles([]);
    setPositivePoints([]);
    setNegativePoints([]);

    setImageSrc(canvas.toDataURL('image/png'));
    handleResize();
  };

  useEffect(() => {
    setVars();

    const handleResizeUpdateVars = () => {
      setVars();
    };

    window.addEventListener('resize', handleResizeUpdateVars);
    return () => {
      window.removeEventListener('resize', handleResizeUpdateVars);
    };
  }, []);

  const drawPoint = (point_x: number, point_y: number, fillStyle: string) => {
    const x = point_x / scaleX + canvasOffSetX.current;
    const y = point_y / scaleY + canvasOffSetY.current;

    const x2 = (x - canvasOffSetX.current) * scaleX;
    const y2 = (y - canvasOffSetY.current) * scaleY;

    const borderWidth = 2; // Grosor del borde
    const borderColor = 'black'; // Color del borde
    const currentStrokeStyle = contextRef.current.strokeStyle;

    contextRef.current.fillStyle = fillStyle;
    contextRef.current.strokeStyle = borderColor; // Establecer el color del borde
    contextRef.current.lineWidth = borderWidth; // Establecer el grosor del borde
    contextRef.current.beginPath();
    contextRef.current.arc(x2, y2, 5, 0, 2 * Math.PI);
    contextRef.current.fill();
    contextRef.current.stroke(); // Dibujar el borde
    contextRef.current.strokeStyle = currentStrokeStyle;

    // console.log('----------------Dibujando punto----------------');
    // console.log('He dibujado el punto guardado como: ');
    // console.log('x: ' + point_x + ' y: ' + point_y);
    // console.log('Pero en realidad he dibujado:');
    // console.log('x: ' + x + ' y: ' + y);
    // console.log('Con un offset de:');
    // console.log('x: ' + canvasOffSetX.current + ' y: ' + canvasOffSetY.current);
    // console.log('--------------------------------\n\n');
  };

  const startDrawingRectangle = ({ nativeEvent }) => {
    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();

    startX.current = (nativeEvent.clientX - canvasOffSetX.current) * scaleX;
    startY.current = (nativeEvent.clientY - canvasOffSetY.current) * scaleY;

    setIsDrawing(true);
  };

  const drawRectangle = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }

    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();

    const newMouseX = (nativeEvent.clientX - canvasOffSetX.current) * scaleX;
    const newMouseY = (nativeEvent.clientY - canvasOffSetY.current) * scaleY;

    const rectWidht = newMouseX - startX.current;
    const rectHeight = newMouseY - startY.current;

    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    contextRef.current.strokeStyle = BOX_COLOR;

    rectangles.forEach(rectangle => {
      contextRef.current.strokeRect(
        rectangle.rect[0].startX,
        rectangle.rect[0].startY,
        rectangle.rect[0].width,
        rectangle.rect[0].height
      );
    });

    positivePoints.forEach(point => {
      drawPoint(point.point.x, point.point.y, POSITIVE_POINT_COLOR);
    });

    negativePoints.forEach(point => {
      drawPoint(point.point.x, point.point.y, NEGATIVE_POINT_COLOR);
    });

    contextRef.current.strokeRect(startX.current, startY.current, rectWidht, rectHeight);
  };

  const stopDrawingRectangle = (nativeEvent: React.MouseEvent) => {
    if (isDrawing) {
      const newMouseX = (nativeEvent.clientX - canvasOffSetX.current) * scaleX;
      const newMouseY = (nativeEvent.clientY - canvasOffSetY.current) * scaleY;

      const rectWidht = newMouseX - startX.current;
      const rectHeight = newMouseY - startY.current;
      addRectangle({
        rect: [
          { startX: startX.current, startY: startY.current, width: rectWidht, height: rectHeight },
        ],
      });
    }
    setIsDrawing(false);
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    const fillStyle = selectedOption === 0 ? NEGATIVE_POINT_COLOR : POSITIVE_POINT_COLOR;

    const x_coord = (event.clientX - canvasOffSetX.current) * scaleX;
    const y_coord = (event.clientY - canvasOffSetY.current) * scaleY;

    const point = { point: { x: x_coord, y: y_coord } };
    addPoint(point);

    // console.log('----------------Creando punto----------------');
    // console.log('He guardado el punto con: ');
    // console.log('x: ' + x_coord + ' y: ' + y_coord);
    // console.log('Pero en realidad he pulsado en:');
    // console.log('x: ' + event.clientX + ' y: ' + event.clientY);
    // console.log('Con un offset de:');
    // console.log('x: ' + canvasOffSetX.current + ' y: ' + canvasOffSetY.current);
    // console.log('--------------------------------\n\n');

    drawPoint(x_coord, y_coord, fillStyle);
  };

  return (
    <div id="image-container">
      <button id="load_image" onClick={capture_image}>
        {' '}
        Cargar imagen{' '}
      </button>
      <div id="canvas">
        {imageSrc && <canvas ref={canvasRef0} id="loaded_image" />}
        <canvas
          className="canvas-container-rect"
          id="captured_canvas"
          ref={canvasRef}
          onMouseDown={startDrawingRectangle}
          onMouseMove={drawRectangle}
          onMouseUp={stopDrawingRectangle}
          onMouseLeave={stopDrawingRectangle}
          onClick={event => {
            if (imageSrc && selectedOption <= 1) {
              handleCanvasClick(event);
            }
          }}
        ></canvas>
      </div>
    </div>
  );
}
