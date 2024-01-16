import * as tf from '@tensorflow/tfjs';
import { OUTPUT_TENSOR_WIDTH, OUTPUT_TENSOR_HEIGHT } from './TensorCameraSetup';

let frameCount = 0;
const frameSkip = 5; // Adjust this value as needed

export function handleCameraStream(model, setPrediction) {
    return (images, updatePreview, gl) => {
        const loop = () => {
            if (frameCount % frameSkip === 0) {
                const nextImageTensor = images.next().value;

                if (nextImageTensor) {
                    tf.tidy(() => {
                        const imageTensor = nextImageTensor.expandDims(0).div(127.5).sub(1);
                        const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);

                        // The result of model.predict should be assigned to a variable
                        const result = model.predict(resizedImage);

                        // Make sure the logits variable is correctly defined
                        // Assuming result is a tensor, the following line extracts its data
                        const logits = result.dataSync(); // Or result.array(), result.arraySync()

                        processPrediction(logits, setPrediction);

                        tf.dispose([nextImageTensor, imageTensor, resizedImage, result]);
                    });
                }
            }
            frameCount++;

            tf.nextFrame().then(loop);
        };

        loop();
    };
}


function processPrediction(logits, setPrediction) {
    const classLabels = ['Book', 'No-Book']; // Define your class labels based on the model
    const highestLogit = logits.indexOf(Math.max(...logits));
    const predictionLabel = classLabels[highestLogit];

    setPrediction(predictionLabel);
}
