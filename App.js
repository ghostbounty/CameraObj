import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { TensorCameraSetup } from './TensorCameraSetup';
import { handleCameraStream } from './CameraStreamHandler';
import { loadModel } from './ModelLoader';
import styles from './styles';

const TensorCamera = cameraWithTensors(Camera);

export default function App() {
    const [tfReady, setTfReady] = useState(false);
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [errorLoadingModel, setErrorLoadingModel] = useState(false);

    async function getCameraPermission() {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
        }
    }

    useEffect(() => {
        getCameraPermission();
        loadModel(setModel, setTfReady, setErrorLoadingModel);
    }, []);

    const handleCameraStreamCallback = useCallback(
        handleCameraStream(model, setPrediction),
        [model, setPrediction]
    );

    if (errorLoadingModel) {
        return <View style={styles.errorMsg}><Text>Error loading model</Text></View>; // Error handling
    }

    if (!tfReady) {
        return <View style={styles.loadingMsg}><Text>Cargando...</Text></View>;
    } else {
        return (
            <View style={styles.container}>
                <TensorCameraSetup
                    TensorCamera={TensorCamera}
                    handleCameraStream={handleCameraStreamCallback} // Updated to use useCallback
                />
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>{prediction || 'Analizando...'}</Text>
                </View>
            </View>
        );
    }
}
