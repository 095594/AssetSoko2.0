function createImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
    });
}

export async function getCroppedImg(imageSrc, cropAreaPixels) {
    try {
        // Load the image
        const image = await createImage(imageSrc);

        // Create a canvas and set its dimensions to the cropped area
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = cropAreaPixels.width;
        canvas.height = cropAreaPixels.height;

        // Draw the cropped portion of the image onto the canvas
        ctx.drawImage(
            image,
            cropAreaPixels.x,
            cropAreaPixels.y,
            cropAreaPixels.width,
            cropAreaPixels.height,
            0,
            0,
            cropAreaPixels.width,
            cropAreaPixels.height
        );

        // Convert the canvas content to a Blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Canvas is empty"));
                        return;
                    }
                    resolve(blob);
                },
                "image/jpeg", // Output format
                0.9 // JPEG quality (90%)
            );
        });
    } catch (error) {
        console.error("Error cropping image:", error);
        throw error;
    }
}