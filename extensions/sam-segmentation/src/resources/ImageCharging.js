import {handleResize } from './ScreenHandler'

export const drawImage = (imageSrc, canvasRef) => {
    if (imageSrc) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, image.width, image.height);
        };

        handleResize()
    }
};


export const handleFileInputChange = (event, setImageSrc) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageSrc(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};
