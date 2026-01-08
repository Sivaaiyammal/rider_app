import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Colors, Fonts } from '../../common/constants/constants';
import { checkCameraPermission, RequestCameraPermission } from '../../common/controllers/PermissionHandler';
import CameraIcon from '../../common/assets/icons/CameraIcon.svg';
import GalleryIcon from '../../common/assets/icons/Gallery.svg';
import { getPresignedImageUrl } from '../../common/utils/getPresignedImageUrl';
import useUserStore from '../../common/store/useUserStore';

const pickerOptions = {
  mediaType: 'photo',
  presentationStyle: 'fullScreen',
  includeBase64: false,
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.8,
};

const DocumentImageScanner = ({
  onScanComplete,
  onImageSelected,
  browseLabel = 'Browse',
  cameraLabel = 'Camera',
  containerStyle = {},
  buttonStyle = {},
  scannerTitle = 'Upload or capture document',
  helperText = 'The app will scan the image and extract readable text.',
  disabled = false,
  disabledMessage = 'Select a document type to enable scanning.',
  documentType = null,
  documentLabel = null,
  initialImage = null, // can be string URL or { uri, ... }
}) => {
  const [isBusy, setBusy] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState(null);

  const {userInfo} = useUserStore();

  const buildAssetPayload = useCallback(asset => ({
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || 'document.jpg',
    fileSize: asset.fileSize,
    width: asset.width,
    height: asset.height,
  }), []);

  const recogniseText = useCallback(async uri => {
    // Run ML Kit text recognition on the captured image URI.
    const result = await TextRecognition.recognize(uri);
    if (!result) {
      return { text: '' };
    }

    const blocks = Array.isArray(result.blocks) ? result.blocks : [];
    const blockText = blocks
      .map(block => block?.text?.trim?.())
      .filter(Boolean)
      .join('\n');
    const extractedText = result.text?.trim?.() || blockText;

    return {
      text: extractedText,
      raw: result,
    };
  }, []);

  const handleScan = useCallback(async asset => {
    setBusy(true);
    setErrorMessage(null);

    try {
      const payload = buildAssetPayload(asset);
      setSelectedImage(payload);
      onImageSelected?.(payload);

      const recognition = await recogniseText(asset.uri);
      setScanResult(recognition);
      onScanComplete?.({
        image: payload,
        text: recognition.text,
        raw: recognition.raw,
      });
    } catch (error) {
      console.warn('DocumentImageScanner scan failed', error);
      setErrorMessage('Unable to read the image. Try again with a clearer photo.');
      setScanResult(null);
    } finally {
      setBusy(false);
    }
  }, [buildAssetPayload, onImageSelected, onScanComplete, recogniseText]);

  const runImagePicker = useCallback(async source => {
    if (disabled) {
      setErrorMessage(null);
      return;
    }
    setBusy(true);
    setErrorMessage(null);

    const pickAction = source === 'camera' ? launchCamera : launchImageLibrary;

    try {
      if (source === 'camera') {
        const hasPermission = await checkCameraPermission();
        if (!hasPermission) {
          await RequestCameraPermission();
          setBusy(false);
          return;
        }
      }

      pickAction(pickerOptions, response => {
        if (response?.didCancel) {
          setBusy(false);
          return;
        }

        if (response?.errorCode) {
          console.warn('Image picker error', response.errorMessage);
          setErrorMessage('Unable to open the picker. Please retry.');
          setBusy(false);
          return;
        }

        const asset = response?.assets?.[0];
        if (!asset?.uri) {
          setErrorMessage('No image returned by picker.');
          setBusy(false);
          return;
        }

        handleScan(asset);
      });
    } catch (error) {
      console.warn('Image picker exception', error);
      setErrorMessage('Something went wrong. Try again.');
      setBusy(false);
    }
  }, [disabled, handleScan]);

  const helper = useMemo(() => helperText?.trim?.(), [helperText]);
  const displayUri = useMemo(() => {
    if (selectedImage?.uri) return selectedImage.uri;
    if (presignedUrl) return presignedUrl;
    return null;
  }, [selectedImage, presignedUrl]);
  const activeDocumentLabel = documentLabel || documentType;

  useEffect(() => {
    // Reset image load state when the source changes
    setImageError(false);
  }, [displayUri]);

  useEffect(() => {
    let isMounted = true;

    const resolveInitialImage = async () => {
      setImageError(false);

      if (!initialImage) {
        if (isMounted) {
          setPresignedUrl(null);
        }
        return;
      }

      const rawUri = typeof initialImage === 'string'
        ? initialImage.trim()
        : initialImage?.uri || initialImage?.url || '';

      if (!rawUri) {
        if (isMounted) {
          setPresignedUrl(null);
        }
        return;
      }

      const lowerUri = rawUri.toLowerCase();
      const isLocalSource = lowerUri.startsWith('file:') || lowerUri.startsWith('content:') || lowerUri.startsWith('data:');

      if (isLocalSource) {
        if (isMounted) {
          setPresignedUrl(rawUri);
        }
        return;
      }

      let objectKey = rawUri;
      if (rawUri.startsWith('http')) {
        try {
          const urlInstance = new URL(rawUri);
          objectKey = decodeURIComponent(urlInstance.pathname.replace(/^\//, ''));
        } catch (error) {
          objectKey = rawUri.replace(/^https:\/\/[^/]+\//, '');
        }
      }

      const presigned = await getPresignedImageUrl(objectKey, userInfo?.token);

      if (!isMounted) {
        return;
      }

      if (presigned) {
        setPresignedUrl(presigned);
        return;
      }

      if (rawUri.startsWith('http')) {
        setPresignedUrl(rawUri);
      } else {
        setPresignedUrl(null);
      }
    };

    resolveInitialImage();

    return () => {
      isMounted = false;
    };
  }, [initialImage, userInfo?.token]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{scannerTitle}</Text>
        {isBusy && <ActivityIndicator size="small" color={Colors.periwinkle} />}
      </View>
      {activeDocumentLabel ? <Text style={styles.typeIndicator}>Selected: {activeDocumentLabel}</Text> : null}
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}

      <View style={styles.previewSurface}>
        {displayUri && !imageError ? (
          <>
            {imageLoading && (
              <ActivityIndicator size="small" color={Colors.periwinkle} style={styles.previewLoader} />
            )}
            <Image
              source={{ uri: displayUri }}
              style={styles.previewImage}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : displayUri && imageError ? (
          <Text style={styles.placeholder}>Image failed to load. Please try again.</Text>
        ) : (
          <Text style={styles.placeholder}>No image selected yet.</Text>
        )}
      </View>

      {/* {scanResult?.text ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Detected Text</Text>
          <Text style={styles.resultContent}>{scanResult.text}</Text>
        </View>
      ) : null} */}

      {/* {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null} */}
      {/* {disabled && !errorMessage ? <Text style={styles.disabledHelper}>{disabledMessage}</Text> : null} */}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.leftActionButton,
            buttonStyle,
            (disabled || isBusy) && styles.disabledActionButton,
          ]}
          onPress={() => runImagePicker('gallery')}
          disabled={disabled || isBusy}
        >
          <GalleryIcon width={24} height={24} />
          <Text style={styles.actionButtonText}>{browseLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.rightActionButton,
            buttonStyle,
            (disabled || isBusy) && styles.disabledActionButton,
          ]}
          onPress={() => runImagePicker('camera')}
          disabled={disabled || isBusy}
        >
          <CameraIcon width={24} height={24} />
          <Text style={styles.actionButtonText}>{cameraLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DocumentImageScanner;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.periwinkle,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.black,
  },
  helper: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.cool_grey,
  },
  typeIndicator: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.periwinkle,
    marginBottom: 4,
  },
  previewSurface: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: Colors.grey_light,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.cool_grey,
  },
  resultBox: {
    backgroundColor: Colors.grey_light,
    borderRadius: 12,
    padding: 12,
  },
  resultTitle: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.black,
    marginBottom: 8,
  },
  resultContent: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.black,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.red,
  },
  disabledHelper: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.cool_grey,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.grey_light,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  leftActionButton: {
    marginHorizontal: 8,
  },
  rightActionButton: {
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.black,
  },
  disabledActionButton: {
    opacity: 0.6,
  },
});
