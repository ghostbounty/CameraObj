import { StyleSheet, Dimensions } from 'react-native';

const CAM_PREVIEW_WIDTH = Dimensions.get('window').width;
const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH * (16 / 9); // Assuming a 16:9 aspect ratio for the camera preview

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    loadingMsg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    camera: {
        width: CAM_PREVIEW_WIDTH,
        height: CAM_PREVIEW_HEIGHT,
        position: 'absolute',
        top: (Dimensions.get('window').height - CAM_PREVIEW_HEIGHT) / 2,
        left: 0,
        zIndex: 1,
    },
    resultContainer: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 2,
    },
    resultText: {
        fontSize: 50,
        color: '#40c022',
        textAlign: 'center',
    },
});
