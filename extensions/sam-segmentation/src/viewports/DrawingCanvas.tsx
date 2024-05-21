import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Point, type Box } from '../types/types';
import {
  POSITIVE_POINT_COLOR,
  NEGATIVE_POINT_COLOR,
  BOX_COLOR,
  BOX_WIDTH,
  BORDER_POINT_COLOR,
  BORDER_POINT_WIDTH,
} from '../resources/const';
import { handleResize } from '../resources/ScreenHandler';
import '../styles/DrawingCanvas.css';

export const DrawingCanvas = ({
  segmenting,
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
  handleScaleChange,
  onCanvasClean,
  imgSrc,
  boxColor,
  pointsRadius,
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const canvasOffSetX = useRef(null);
  const canvasOffSetY = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);

  window.onresize = handleResize;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    contextRef.current = context;
    contextRef.current.strokeStyle = boxColor;
    contextRef.current.lineWidth = BOX_WIDTH;

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
  }, [positivePoints, negativePoints, rectangles]);

  useEffect(() => {
    if (selectedOption === 3) {
      eraseScreen();
      onCanvasClean();
    }
  }, [selectedOption]);

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

  const startDrawingRectangle = ({ nativeEvent }) => {
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

    contextRef.current.strokeStyle = boxColor;
    contextRef.current.lineWidth = BOX_WIDTH;

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
    const x_coord = point_x;
    const y_coord = point_y;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    contextRef.current = context;

    const currentStrokeStyle = contextRef.current.strokeStyle;

    contextRef.current.fillStyle = fillStyle;
    contextRef.current.strokeStyle = BORDER_POINT_COLOR;
    contextRef.current.lineWidth = BORDER_POINT_WIDTH;

    contextRef.current.beginPath();
    contextRef.current.arc(x_coord, y_coord, pointsRadius, 0, 2 * Math.PI);
    contextRef.current.fill();
    contextRef.current.stroke();
    contextRef.current.strokeStyle = currentStrokeStyle;
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const canvasOffSet = canvas.getBoundingClientRect();
    canvasOffSetY.current = canvasOffSet.top;
    canvasOffSetX.current = canvasOffSet.left;

    const x_coord = (event.clientX - canvasOffSetX.current) * (canvas.width / canvasOffSet.width);
    const y_coord = (event.clientY - canvasOffSetY.current) * (canvas.height / canvasOffSet.height);

    handleScaleChange(canvas.width / canvasOffSet.width, canvas.height / canvasOffSet.height);

    const point = { point: { x: x_coord, y: y_coord } };
    const fillStyle = selectedOption === 0 ? NEGATIVE_POINT_COLOR : POSITIVE_POINT_COLOR;
    drawPoint(x_coord, y_coord, fillStyle);

    addPoint(point);
  };

  useEffect(() => {
    // Draw the image on the canvas as background
    if (imgSrc === undefined) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [imgSrc]);

  return (
    <canvas
      className={`canvas-container-rect  ${segmenting ? '' : 'not-segmenting'}`}
      id="new_captured_canvas"
      ref={canvasRef}
      onMouseDown={startDrawingRectangle}
      onMouseMove={drawRectangle}
      onMouseUp={stopDrawingRectangle}
      onMouseLeave={stopDrawingRectangle}
      onClick={handleCanvasClick}
      width={activeCanvasWidth - 20}
      height={activeCanvasHeight - 20}
      style={{
        position: 'fixed',
        top: `${activeCanvasTop}px`,
        left: `${activeCanvasLeft}px`,
        zIndex: 1000,
        pointerEvents: 'auto',
        display: 'block',
      }}
    ></canvas>
  );
};
