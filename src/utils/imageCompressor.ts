/**
 * Utility to compress an image file on the client side using HTML5 Canvas.
 * Returns a promise that resolves to the compressed image as a base64 string.
 */
export const compressImage = (
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("File is not an image."));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Adjust dimensions to maintain aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Failed to get 2D context from canvas."));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG for maximum compression
                const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
                resolve(compressedDataUrl);
            };
            img.onerror = (error) => {
                reject(error);
            };
            img.src = event.target?.result as string;
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
};
