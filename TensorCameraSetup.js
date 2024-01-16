import React from 'react';
import { Camera } from 'expo-camera';
import { Dimensions } from 'react-native';

// Reduce the camera preview resolution for better performance
const scale = 0.75; // Adjust this scale to decrease the resolution
export const CAM_PREVIEW_WIDTH = Dimensions.get('window').width * scale;
export const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH * (16 / 9);

// Adjust OUTPUT_TENSOR_WIDTH to be a multiple of 4 for OpenGL compatibility
export const OUTPUT_TENSOR_WIDTH = Math.ceil(CAM_PREVIEW_WIDTH / 4) * 4;
export const OUTPUT_TENSOR_HEIGHT = Math.ceil(CAM_PREVIEW_HEIGHT / 4) * 4;

export function TensorCameraSetup({ TensorCamera, handleCameraStream }) {
    return (
        <TensorCamera
            style={{ width: '100%', height: '100%', zIndex: 1 }}
            type={Camera.Constants.Type.back}
            cameraTextureHeight={CAM_PREVIEW_HEIGHT}
            cameraTextureWidth={CAM_PREVIEW_WIDTH}
            resizeHeight={OUTPUT_TENSOR_HEIGHT}
            resizeWidth={OUTPUT_TENSOR_WIDTH}
            resizeDepth={3}
            onReady={handleCameraStream}
            autorender={true}
        />
    );
}
