import * as tf from '@tensorflow/tfjs';
import {
  bundleResourceIO,
  cameraWithTensors,
} from '@tensorflow/tfjs-react-native';
import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const TensorCamera = cameraWithTensors(Camera);

//El tamaño de la vista previa de la cámara.
//
// Estos son sólo para dispositivos iOS.
const CAM_PREVIEW_WIDTH = Dimensions.get('window').width;
const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH / (9 / 16);

// El tamaño del tensor de salida (imagen) de TensorCamera.
//
// 9/16.
const OUTPUT_TENSOR_WIDTH = 270;
const OUTPUT_TENSOR_HEIGHT = 480;

export default function App() {
  const [tfReady, setTfReady] = useState(false);
  const [model, setModel] = useState();
  const [isHotdog, setIsHotdog] = useState(null);

   // Tendremos que cancelar el cuadro de animación correctamente.
   //
   // - nulo: no establecido (valor inicial)
   // - 0: el cuadro de animación ha sido cancelado
   // - >0: se ha programado el cuadro de animación.
  const rafId = useRef(null);

 // Asegúrese de que tfjs y tfjs-react-native funcionen, especialmente la cámara tensor.
  useEffect(() => {
    async function prepare() {
      rafId.current = null;

      // Solicitar permiso de la cámara.
      await Camera.requestCameraPermissionsAsync();

      // Espere a que tfjs inicialice el backend.
      await tf.ready();

      // Cargar modelo.
      const modelJson = require('./model/model.json');
      const modelWeights = require('./model/weights.bin');
      // Oh, también necesitamos hacer que metro reconozca archivos .bin.
      // Ver metro.config.js.
      //
      // Este modelo en particular es un "modelo de capas".
      //
      // bundleResourceIO es una función de utilidad proporcionada por tfjs-react-native
      // para leer archivos de modelo de un paquete.
      const model = await tf.loadLayersModel(
        bundleResourceIO(modelJson, modelWeights)
      );
      setModel(model);

      // ¡¡Listo!!
      setTfReady(true);
    }

    prepare();
  }, []);

  // Esto se llamará cuando el componente esté desmontado.
  useEffect(() => {
    return () => {
      if (rafId.current != null && rafId.current !== 0) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, []);

  // Controlador que se llamará cuando TensorCamera esté lista.
  const handleCameraStream = (images, updatePreview, gl) => {
    console.log('¡¡Camara Lista!!');
    // Aquí queremos obtener el tensor de cada cuadro (imagen) y alimentar el
    // tensor del modelo (que entrenaremos por separado).
    //
    // Haremos esto repetidamente en un bucle de animación.
    const loop = () => {
      // Puede que esto no sea necesario, pero agréguelo aquí por si acaso.
      if (rafId.current === 0) {
        return;
      }

      // Envuelva esto dentro de tf.tidy para liberar la memoria tensorial automáticamente.
      tf.tidy(() => {
        // Consigue el tensor.
        //
        // También necesitamos normalizar los datos rgb del tensor/imagen de 0-255
        // a -1 a 1.
        //
        // También necesitamos agregar una dimensión adicional para que su forma sea [1, w, h, 3].
        const imageTensor = images.next().value.expandDims(0).div(127.5).sub(1);

        // Desde la máquina enseñable, sabemos que la imagen de entrada será
        // recortada desde el centro y redimensionada a 224x224. Entonces tenemos que hacer
        // lo mismo aquí. Por suerte, tfjs tiene utilidad para esto.
        //
        // Lea más sobre estos en el repositorio de tfjs:
        // https://github.com/tensorflow/tfjs
        //
        // calcula la posición relativa Y (0-1) para comenzar a recortar el
        // imagen. Por cierto, asumimos que la imagen está en modo vertical.
        //
        // Siéntete libre de manejar el modo horizontal aquí.
        const f =
          (OUTPUT_TENSOR_HEIGHT - OUTPUT_TENSOR_WIDTH) /
          2 /
          OUTPUT_TENSOR_HEIGHT;
        const cropped = tf.image.cropAndResize(
           // Tensor de imagen.
          imageTensor,
          // Cajas. Dice que comenzamos a recortar desde (x=0, y=f) hasta (x=1, y=1-f).
          // Estos valores son todos relativos (de 0 a 1).
          tf.tensor2d([f, 0, 1 - f, 1], [1, 4]),
          // El primer cuadro de arriba
          [0],
          // El tamaño final después del cambio de tamaño.
          [224, 224]
        );

        // Alimente el tensor procesado al modelo y obtenga los tensores resultantes.
        const result = model.predict(cropped);
        // Obtenga los datos reales (una matriz en este caso) del tensor resultante.
        const logits = result.dataSync();
        // Logits debería ser la probabilidad de dos clases (hot dog, no hot dog).
        if (logits) {
          setIsHotdog(logits[0] > logits[1]);
        } else {
          setIsHotdog(null);
        }
      });

      rafId.current = requestAnimationFrame(loop);
    };

    loop();
  };

  if (!tfReady) {
    return (
      <View style={styles.loadingMsg}>
        <Text>Cargando...</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <TensorCamera
          style={styles.camera}
          autorender={true}
          type={Camera.Constants.Type.back}
          // Accesorios relacionados con el tensor de salida.
          // Estos deciden la forma del tensor de salida de la cámara.
          resizeWidth={OUTPUT_TENSOR_WIDTH}
          resizeHeight={OUTPUT_TENSOR_HEIGHT}
          resizeDepth={4}
          onReady={handleCameraStream}
        />
        <View
          style={
            isHotdog
              ? styles.resultContainerHotdog
              : styles.resultContainerNotHotdog
          }
        >
          <Text style={styles.resultText}>
            {isHotdog? 'Laptop!' : 'Libro'}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: CAM_PREVIEW_WIDTH,
    height: CAM_PREVIEW_HEIGHT,
    marginTop: Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
  },
  // Tensor camera requires z-index.
  camera: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  loadingMsg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContainerHotdog: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#00aa00',
  },
  resultContainerNotHotdog: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#aa0000',
  },
  resultText: {
    fontSize: 30,
    color: 'white',
  },
});



