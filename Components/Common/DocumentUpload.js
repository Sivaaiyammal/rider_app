import { useState } from 'react'
import RNFS from 'react-native-fs';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import camera from "../../Assets/DriverAppIcons/camera.webp"
import uploadIcon from "../../Assets/DriverAppIcons/odometerImg.webp"
import { launchCamera } from 'react-native-image-picker';
import NotificationManager from '../../Components/Notification/NotificationManager';
import ButtonSecondaryRect from '../../Components/Buttons/ButtonSecondaryRect';


const getImageDataFromUrl = (localImagePath) => {
    return new Promise((resolve, reject) => {

        RNFS.readFile(localImagePath, 'base64')
            .then((imageData) => {
                resolve(imageData)
            })
            .catch((error) => {
                reject(error)
            });
    })

}

export default function DocumentUpload(props) {

    let [img, setImage] = useState(props.image)
    let [imageData, setImageData] = useState(null)
    let {onChange} = props


    const handleCaptureImage = async () => {

        const result = await launchCamera({ quality: 0.3 })
        if (result.didCancel) {
            NotificationManager.warning('Image Capture Cancelled', 3000, 'bottom')
            return
        }
        let url = result.assets[0].uri
        setImage(url)
        let imageData = await getImageDataFromUrl(url)
        setImageData(imageData)
        onChange(imageData,url)
    };

    return (
        <View style={styles.inputContainer} >
            <View style={styles.imageContainer}>
                {
                    img ? <Image
                        source={{ uri: img }}
                        style={{ width: 250, height: 130 }}
                    /> : <View style={{ alignItems: 'center' }}>
                        <Image style={{ height: 30, width: 30, marginTop: 20 }} source={uploadIcon} />
                        <Text style={{ fontSize: 16, color: '#757575', marginVertical: 5 }}>Capture Image</Text>
                        <Text style={styles.miniText}>(Make sure the Captured image is clearly visible)</Text>
                    </View>
                }

                <TouchableOpacity style={styles.captureBtn} onPress={() => handleCaptureImage()}>
                    <Image style={styles.camera} source={camera} />
                    <Text style={{ color: '#ff5a92', fontSize: 14, fontWeight: '500' }}>{img ? "Re Capture" : "Capture"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        color: '#212121',
        fontSize: 14,
        marginBottom: 5
    },
    text: {
        color: '#212121',
        fontSize: 15,
    },
    imageContainer: {
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#bdbdbd',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 8,
        marginTop: 5
    },
    miniText: {
        fontSize: 10,
        marginBottom: 5,
        textAlign: 'center'
    },
    captureBtn: {
        borderColor: '#ff5a92',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdf3f1',
        marginVertical: 10
    },
    camera: {
        height: 12,
        width: 15,
        marginRight: 5
    },
    confirmBtn: {
        backgroundColor: '#212121',
        paddingHorizontal: 30,
        paddingVertical: 8,
        borderRadius: 8
    },
    btnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#d6d6d6',
        padding: 8,
        fontSize: 12,
        borderRadius: 8,
        color: '#757575'
    },
})