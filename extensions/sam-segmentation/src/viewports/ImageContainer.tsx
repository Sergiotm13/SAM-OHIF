import { useState, useRef, useEffect } from "react";
import "../styles/ImageContainer.css";
import { drawImage, handleFileInputChange } from "../resources/ImageCharging";
import React from "react";

export default function ImageContainer({ selectedOption }) {
    const [imageSrc, setImageSrc] = useState("");
    const canvasRef = useRef(null);
    const canvasRef0 = useRef(null)
    const contextRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);

    const [scaleX, setScaleX] = useState<number>();
    const [scaleY, setScaleY] = useState<number>();

    const canvasOffSetX = useRef(null);
    const canvasOffSetY = useRef(null);
    const startX = useRef(null);
    const startY = useRef(null);


    const [rectangles, setRectangles] = useState([]);
    const [points, setPoints] = useState([]);

    const handleResize = () => {
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
    window.onresize = handleResize;

    const addRectangle = (newRectangle) => {
        setRectangles((prevRectangles) => {
            const updatedRectangles = [...prevRectangles, newRectangle];
            return updatedRectangles;
        });
    };

    const addPoint = (newPoint) => {
        setPoints((prevPoints) => {
            const updatedPoints = [...prevPoints, newPoint];
            return updatedPoints;
        });
    };

    useEffect(() => {
        if(!(imageSrc && selectedOption === 1)){
            setIsDrawing(false)
        }
    }, [isDrawing]);

    useEffect(() => {
        drawImage(imageSrc, canvasRef0);
        handleResize();
        setVars();
    }, [imageSrc]);

    const setVars = () => {
        const canvas = canvasRef.current;

        const context = canvas.getContext("2d");
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 5;
        contextRef.current = context;

        const canvasOffSet = canvas.getBoundingClientRect();
        canvasOffSetY.current = canvasOffSet.top;
        canvasOffSetX.current = canvasOffSet.left;

        setScaleX(canvas.width / canvasOffSet.width);
        setScaleY(canvas.height / canvasOffSet.height);
    }

    const capture_image = () => {
      const canvas = document.getElementsByClassName('cornerstone-canvas')[0] as HTMLCanvasElement;
      if (!canvas) return;

      // Obtener las dimensiones de la imagen
      const imageWidth = canvas.width;
      const imageHeight = canvas.height;

      // Establecer las dimensiones de los elementos canvas, loaded_image y other_canvas
      const loadedImage = document.getElementById('loaded_image') as HTMLCanvasElement;
      const otherCanvas = document.getElementById('other_canvas') as HTMLCanvasElement;

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
      setPoints([]);

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

    const drawPoint = (clientX, clientY) => {
        const x = (clientX - canvasOffSetX.current) * scaleX;
        const y = (clientY - canvasOffSetY.current) * scaleY;

        contextRef.current.fillStyle = "red";
        contextRef.current.beginPath();
        contextRef.current.arc(x, y, 2, 0, 2 * Math.PI);
        contextRef.current.fill();
    };

    const startDrawingRectangle = ({nativeEvent}) => {
        nativeEvent.preventDefault();
        nativeEvent.stopPropagation();

        startX.current = (nativeEvent.clientX - canvasOffSetX.current) * scaleX;
        startY.current = (nativeEvent.clientY - canvasOffSetY.current) * scaleY;

        setIsDrawing(true);
    };

    const drawRectangle = ({nativeEvent}) => {
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

        // Aquí estableces el color de los rectángulos como rojo
        contextRef.current.strokeStyle = "red";

        rectangles.forEach((rectangle) => {
            contextRef.current.strokeRect(rectangle.rect[0].startX,
                rectangle.rect[0].startY,
                rectangle.rect[0].width,
                rectangle.rect[0].height);
            });

        points.forEach(point => {
            drawPoint(point.point.x, point.point.y);
        })

        contextRef.current.strokeRect(startX.current, startY.current, rectWidht, rectHeight);
    };

    const stopDrawingRectangle = ({nativeEvent}) => {
        if (isDrawing)
        {
            const newMouseX = (nativeEvent.clientX - canvasOffSetX.current) * scaleX;
            const newMouseY = (nativeEvent.clientY - canvasOffSetY.current) * scaleY;

            const rectWidht = newMouseX - startX.current;
            const rectHeight = newMouseY - startY.current;
            addRectangle({
                rect: [{ startX: startX.current, startY: startY.current, width: rectWidht, height: rectHeight }],
            });
        }
        setIsDrawing(false);
    };

    const handleCanvasClick = (event) => {
        addPoint({point:{x: event.clientX, y: event.clientY}})
        drawPoint(event.clientX, event.clientY);
    };



    return (
        <div id="image-container">
            <button id="load_image" onClick={capture_image}> Cargar imagen </button>
            <div id="canvas">
                {imageSrc && <canvas ref={canvasRef0} id="loaded_image"/>}
                <canvas className="canvas-container-rect"
                    id="other_canvas"
                    ref={canvasRef}
                    onMouseDown={startDrawingRectangle}
                    onMouseMove={drawRectangle}
                    onMouseUp={stopDrawingRectangle}
                    onMouseLeave={stopDrawingRectangle}
                    onClick={(event) => {
                        if (imageSrc && selectedOption == 0) {
                            handleCanvasClick(event);
                        }
                    }}>
                </canvas>
            </div>
        </div>
    );
}
