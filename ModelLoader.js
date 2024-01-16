import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

export async function loadModel(setModel, setTfReady, setErrorLoadingModel) {
    try {
        // Initialize TensorFlow.js
        await tf.ready();

        // Specify the model's JSON and weights file.
        // Update these paths to point to your model's files.
        const modelJson = require('./model/model.json');
        const modelWeights = require('./model/weights.bin');

        // Load the model using tf.loadLayersModel and bundleResourceIO.
        const model = await tf.loadLayersModel(
            bundleResourceIO(modelJson, modelWeights)
        );

        // Set the model in the state of your component.
        setModel(model);

        // Update the state to indicate TensorFlow.js is ready.
        setTfReady(true);
    } catch (error) {
        console.error("Error loading the model: ", error);
        setErrorLoadingModel(true); // Set error state
    }
}
