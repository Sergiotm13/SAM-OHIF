import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Point, type Box } from '../types/types';
import { POSITIVE_POINT_COLOR, NEGATIVE_POINT_COLOR, BOX_COLOR } from '../resources/const';
import { handleResize } from '../resources/ScreenHandler';
// import the css
import '../styles/DrawingCanvas.css';
import { add } from '@kitware/vtk.js/Common/Core/Math';

export const DrawingCanvas = ({
  selectedOption,
  servicesManager,
  rectangles,
  setRectangles,
  positivePoints,
  setPositivePoints,
  negativePoints,
  setNegativePoints,
  activeCanvasWidth,
  activeCanvasHeight,
  activeCanvasTop,
  activeCanvasLeft,
}) => {
  const { viewportGridService } = servicesManager.services;

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const [scaleX, setScaleX] = useState<number>();
  const [scaleY, setScaleY] = useState<number>();

  const canvasOffSetX = useRef(null);
  const canvasOffSetY = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);

  window.onresize = handleResize;

  useEffect(() => {
    console.log('REFRESHED\n\n\n');
  }, []);

  useEffect(() => {
    if (!(selectedOption === 2)) {
      setIsDrawing(false);
    }
  }, [isDrawing]);

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

  const eraseScreen = () => {
    setRectangles([]);
    setPositivePoints([]);
    setNegativePoints([]);
    canvasRef.current
      .getContext('2d')
      .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => {
    if (selectedOption === 3) {
      eraseScreen();
    }
  }, [selectedOption]);

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

    if (canvasOffSet.width === 0 || canvasOffSet.height === 0) {
      setScaleX(1);
      setScaleY(1);
      return;
    }

    setScaleX(canvas.width / canvasOffSet.width);
    setScaleY(canvas.height / canvasOffSet.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const context = canvas.getContext('2d');

    contextRef.current = context;
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
      console.log('Dibujando punto positivo');
      drawPoint(point.point.x, point.point.y, POSITIVE_POINT_COLOR);
    });

    negativePoints.forEach(point => {
      console.log('Dibujando punto negativo');

      drawPoint(point.point.x, point.point.y, NEGATIVE_POINT_COLOR);
    });
  }, []);

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

  const startDrawingRectangle = ({ nativeEvent }) => {
    console.log('Start drawing rectangle');
    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();

    const canvas = canvasRef.current;
    const canvasOffSet = canvas.getBoundingClientRect();
    canvasOffSetY.current = canvasOffSet.top;
    canvasOffSetX.current = canvasOffSet.left;

    startX.current =
      (nativeEvent.clientX - canvasOffSetX.current) * (canvas.width / canvasOffSet.width);
    startY.current =
      (nativeEvent.clientY - canvasOffSetY.current) * (canvas.height / canvasOffSet.height);

    setIsDrawing(true);
  };

  const drawRectangle = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }

    console.log('Drawing rectangle');

    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();

    const canvas = canvasRef.current;
    const canvasOffSet = canvas.getBoundingClientRect();

    const newMouseX =
      (nativeEvent.clientX - canvasOffSetX.current) * (canvas.width / canvasOffSet.width);
    const newMouseY =
      (nativeEvent.clientY - canvasOffSetY.current) * (canvas.height / canvasOffSet.height);

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

    console.log('Drawing rectangle ends here');
    contextRef.current.strokeRect(startX.current, startY.current, rectWidht, rectHeight);
  };

  const stopDrawingRectangle = (nativeEvent: React.MouseEvent) => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const canvasOffSet = canvas.getBoundingClientRect();
      const newMouseX =
        (nativeEvent.clientX - canvasOffSetX.current) * (canvas.width / canvasOffSet.width);
      const newMouseY =
        (nativeEvent.clientY - canvasOffSetY.current) * (canvas.height / canvasOffSet.height);

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

  const drawPoint = (point_x: number, point_y: number, fillStyle: string) => {
    const canvas = canvasRef.current;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';

    contextRef.current = context;

    const borderWidth = 2; // Grosor del borde
    const borderColor = 'black'; // Color del borde
    const currentStrokeStyle = contextRef.current.strokeStyle;

    contextRef.current.fillStyle = fillStyle;
    contextRef.current.strokeStyle = borderColor; // Establecer el color del borde
    contextRef.current.lineWidth = borderWidth; // Establecer el grosor del borde
    contextRef.current.beginPath();
    contextRef.current.arc(point_x, point_y, 5, 0, 2 * Math.PI);
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

  const handleCanvasClick = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const canvasOffSet = canvas.getBoundingClientRect();
    canvasOffSetY.current = canvasOffSet.top;
    canvasOffSetX.current = canvasOffSet.left;

    const x_coord = (event.clientX - canvasOffSetX.current) * (canvas.width / canvasOffSet.width);
    const y_coord = (event.clientY - canvasOffSetY.current) * (canvas.height / canvasOffSet.height);

    const point = { point: { x: x_coord, y: y_coord } };
    const radius = 5;
    const borderWidth = 2; // Grosor del borde
    const borderColor = 'black'; // Color del borde
    const currentStrokeStyle = contextRef.current.strokeStyle;
    context.beginPath();
    context.arc(x_coord, y_coord, radius, 0, 2 * Math.PI);
    const fillStyle = selectedOption === 0 ? NEGATIVE_POINT_COLOR : POSITIVE_POINT_COLOR;
    context.fillStyle = fillStyle;
    contextRef.current.strokeStyle = borderColor; // Establecer el color del borde
    contextRef.current.lineWidth = borderWidth; // Establecer el grosor del borde
    context.fill();
    contextRef.current.stroke(); // Dibujar el borde
    contextRef.current.strokeStyle = currentStrokeStyle;

    console.log('----------------Creando punto----------------');
    console.log('He guardado el punto con: ');
    console.log('x: ' + x_coord + ' y: ' + y_coord);
    console.log('Pero en realidad he pulsado en:');
    console.log('x: ' + event.clientX + ' y: ' + event.clientY);
    console.log('Con un offset de:');
    console.log('x: ' + canvasOffSetX.current + ' y: ' + canvasOffSetY.current);
    console.log('Con una escala de:');
    console.log(
      'x: ' + canvas.width / canvasOffSet.width + ' y: ' + canvas.height / canvasOffSet.height
    );
    console.log('--------------------------------\n\n');

    addPoint(point);
  };

  return (
    <canvas
      className="canvas-container-rect"
      id="new_captured_canvas"
      ref={canvasRef}
      onMouseDown={startDrawingRectangle}
      onMouseMove={drawRectangle}
      onMouseUp={stopDrawingRectangle}
      onMouseLeave={stopDrawingRectangle}
      onClick={handleCanvasClick}
      style={{
        position: 'fixed',
        top: `${activeCanvasTop}px`,
        left: `${activeCanvasLeft}px`,
        width: `${activeCanvasWidth}px`,
        height: `${activeCanvasHeight}px`,
        zIndex: 9999999991000,
        pointerEvents: 'auto',
        display: 'block',
      }}
    ></canvas>
  );
};
