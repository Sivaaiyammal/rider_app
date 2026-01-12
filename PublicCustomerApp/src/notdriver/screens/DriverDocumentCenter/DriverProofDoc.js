import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import NavBar from '../../../common/components/NavBar';
import DocumentImageScanner from '../../components/DocumentImageScanner';
import usePublicDriverStore from '../../store/usePublicDriverStore';
import { Colors, Fonts } from '../../../common/constants/constants';
import { useStackScreenStore } from '../../../common/store/useStackScreenStore';
import publicrideDriverApi from '../../api/publicrideDriverApi';
import { showNotification } from '../../../common/components/Alerts/showNotification';
import useUserStore from '../../../common/store/useUserStore';
import UseBackButton from '../../../common/hooks/UseBackButton';

const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
const aadhaarDigitsPattern = /^\d{12}$/;
const panPattern = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/i;

const formatAadhaar = value => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  if (!digits) {
    return '';
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const DriverProofDoc = () => {
  const { t } = useTranslation();
  const { goBack } = useStackScreenStore();
  const {
    driverInfo,
    setDriverInfo,
    setDocumentFile,
    updateDocumentStatus,
    aadhaarDocEntry,
    panDocEntry,
  } = usePublicDriverStore(state => {
    const aadhaarDocEntry = state.documents.find(doc => doc.id === 'aadhar') || null;
    const panDocEntry = state.documents.find(doc => doc.id === 'panCard') || null;

    return {
      driverInfo: state.driverInfo,
      setDriverInfo: state.setDriverInfo,
      setDocumentFile: state.setDocumentFile,
      updateDocumentStatus: state.updateDocumentStatus,
      aadhaarDocEntry,
      panDocEntry,
    };
  });
  const { userInfo } = useUserStore();

  const {setDocumentsCompleteStatus} = usePublicDriverStore();

  const [activeTab, setActiveTab] = useState('aadhaar');
  const [aadhaarNumber, setAadhaarNumber] = useState(driverInfo?.aadharNo || '');
  const [panNumber, setPanNumber] = useState(driverInfo?.panNo || '');
  const [aadhaarScanMessage, setAadhaarScanMessage] = useState('');
  const [panScanMessage, setPanScanMessage] = useState('');
  const [uploading, setUploading] = useState({ aadhar: false, panCard: false });
  const [pendingImage, setPendingImage] = useState({ aadhar: null, panCard: null });
  const { aadharDocument, panDocument } = driverInfo || {};

  const {setIsApproved} = usePublicDriverStore();

  const switchOptions = useMemo(() => ([
    { id: 'aadhaar', label: t('aadhaar_card', { defaultValue: 'Aadhaar Card' }) },
    { id: 'pan', label: t('pan_card', { defaultValue: 'PAN Card' }) },
  ]), [t]);

  const aadhaarInitialImage = useMemo(() => {
    if (aadhaarDocEntry?.file) {
      return aadhaarDocEntry.file;
    }
    return aadharDocument || null;
  }, [aadhaarDocEntry, aadharDocument]);

  const panInitialImage = useMemo(() => {
    if (panDocEntry?.file) {
      return panDocEntry.file;
    }
    return panDocument || null;
  }, [panDocEntry, panDocument]);

  const extractAadhaarNumber = useCallback(text => {
    if (!text) {
      return '';
    }
    const match = text.replace(/[^0-9\s]/g, ' ').match(aadhaarPattern);
    if (match) {
      return match[0].replace(/\s+/g, '');
    }
    const digits = text.replace(/\D/g, '');
    if (digits.length === 12) {
      return digits;
    }
    return '';
  }, []);

  const extractPanNumber = useCallback(text => {
    if (!text) {
      return '';
    }
    const match = text.toUpperCase().match(panPattern);
    return match ? match[0] : '';
  }, []);

  const uploadProofDocument = useCallback(async (docId, image) => {
    if (!image?.uri) {
      return;
    }

    setUploading(prev => ({ ...prev, [docId]: true }));

    const formData = new FormData();
    formData.append(docId, {
      uri: image.uri,
      name: image.name || `${docId}.jpg`,
      type: image.type || 'image/jpeg',
    });

    const docLabel = docId === 'aadhar'
      ? t('aadhaar_card', { defaultValue: 'Aadhaar Card' })
      : t('pan_card', { defaultValue: 'PAN Card' });
    const driverDocKey = docId === 'aadhar' ? 'aadharDocument' : 'panDocument';

    try {
      const response = await publicrideDriverApi.updateDriverProof(formData, userInfo?.token);
      if (response?.success) {
        setDocumentFile(docId, image);
        updateDocumentStatus(docId, 'uploaded');
        setDriverInfo({ [driverDocKey]: image });
        setPendingImage(prev => ({ ...prev, [docId]: null }));
        setDocumentsCompleteStatus(true)
        setIsApproved(false)
        goBack();
        showNotification(
          docLabel,
          t('document_upload_success', { defaultValue: 'Document updated successfully.' }),
          'success',
        );
      } else {
        throw new Error(response?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error updating driver proof:', error);
      showNotification(
        docLabel,
        error?.message || t('document_upload_failed', { defaultValue: 'Unable to upload document.' }),
        'danger',
      );
    } finally {
      setUploading(prev => ({ ...prev, [docId]: false }));
    }
  }, [setDocumentFile, setDriverInfo, setPendingImage, t, updateDocumentStatus, userInfo?.token]);

  const handleAadhaarScan = useCallback(result => {
    if (!result) {
      setAadhaarScanMessage('');
      return;
    }

    const extracted = extractAadhaarNumber(result.text || '');
    if (extracted && aadhaarDigitsPattern.test(extracted)) {
      const formatted = formatAadhaar(extracted);
      setAadhaarNumber(formatted);
      setDriverInfo({ aadharNo: extracted });
      setAadhaarScanMessage(
        t('details_detected_review', {
          defaultValue: 'Details detected automatically. Review before submitting.',
        }),
      );
    } else {
      setAadhaarScanMessage(
        t('details_not_detected_update_manual', {
          defaultValue: 'Could not extract Aadhaar number. Update the field manually.',
        }),
      );
    }
  }, [extractAadhaarNumber, setDriverInfo, t]);

  const handlePanScan = useCallback(result => {
    if (!result) {
      setPanScanMessage('');
      return;
    }

    const extracted = extractPanNumber(result.text || '');
    if (extracted) {
      const formatted = extracted.toUpperCase();
      setPanNumber(formatted);
      setDriverInfo({ panNo: formatted });
      setPanScanMessage(
        t('details_detected_review', {
          defaultValue: 'Details detected automatically. Review before submitting.',
        }),
      );
    } else {
      setPanScanMessage(
        t('details_not_detected_update_manual', {
          defaultValue: 'Could not extract PAN number. Update the field manually.',
        }),
      );
    }
  }, [extractPanNumber, setDriverInfo, t]);

  const renderAadhaarSection = () => (
    <View style={styles.sectionContainer}>
      <DocumentImageScanner
        key="aadhaar-scanner"
        documentLabel={t('aadhaar_card', { defaultValue: 'Aadhaar Card' })}
        browseLabel={t('browse', { defaultValue: 'Browse' })}
        cameraLabel={t('camera', { defaultValue: 'Camera' })}
        onScanComplete={handleAadhaarScan}
        cameraType='back'
        onImageSelected={image => {
          if (image) {
            setPendingImage(prev => ({ ...prev, aadhar: image }));
            setDriverInfo({ aadharDocument: image });
          }
        }}
        helperText={uploading.aadhar
          ? t('document_upload_in_progress', { defaultValue: 'Uploading document. Please wait…' })
          : pendingImage.aadhar
            ? t('document_ready_to_upload', { defaultValue: 'Document ready. Tap Upload to send.' })
            : t('aadhaar_scan_helper', {
                defaultValue: 'Upload or capture the Aadhaar card to detect the number automatically.',
              })}
        scannerTitle={t('upload_aadhaar_card', { defaultValue: 'Upload or capture Aadhaar card' })}
        containerStyle={styles.scannerContainer}
        initialImage={aadhaarInitialImage}
        disabled={uploading.aadhar}
        disabledMessage={t('document_upload_in_progress', { defaultValue: 'Uploading document. Please wait…' })}
      />
      {/* {aadhaarScanMessage ? <Text style={styles.helperText}>{aadhaarScanMessage}</Text> : null}
      <InputField
        style={styles.textField}
        label={t('aadhaar_number', { defaultValue: 'Aadhaar Number' })}
        value={aadhaarNumber}
        keyboardType="numeric"
        maxLength={14}
        onChangeText={text => {
          const digits = text.replace(/\D/g, '').slice(0, 12);
          const formatted = formatAadhaar(digits);
          setAadhaarNumber(formatted);
          setDriverInfo({ aadharNo: digits });
          setAadhaarScanMessage('');
        }}
        isRequired
        editable={false}
      /> */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          (!pendingImage.aadhar || uploading.aadhar) && styles.uploadButtonDisabled,
        ]}
        onPress={async () => {
          if (!pendingImage.aadhar || uploading.aadhar) {
            if (!pendingImage.aadhar) {
              showNotification(
                t('aadhaar_card', { defaultValue: 'Aadhaar Card' }),
                t('select_document_before_upload', { defaultValue: 'Select or capture the document first.' }),
                'warning',
              );
            }
            return;
          }
          await uploadProofDocument('aadhar', pendingImage.aadhar);
        }}
        disabled={!pendingImage.aadhar || uploading.aadhar}
      >
        {uploading.aadhar ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.uploadButtonText}>
            {t('upload_aadhaar_document', { defaultValue: 'Upload Aadhaar Document' })}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPanSection = () => (
    <View style={styles.sectionContainer}>
      <DocumentImageScanner
        key="pan-scanner"
        documentLabel={t('pan_card', { defaultValue: 'PAN Card' })}
        browseLabel={t('browse', { defaultValue: 'Browse' })}
        cameraLabel={t('camera', { defaultValue: 'Camera' })}
        onScanComplete={handlePanScan}
        cameraType='back'
        onImageSelected={image => {
          if (image) {
            setPendingImage(prev => ({ ...prev, panCard: image }));
            setDriverInfo({ panDocument: image });
          }
        }}
        helperText={uploading.panCard
          ? t('document_upload_in_progress', { defaultValue: 'Uploading document. Please wait…' })
          : pendingImage.panCard
            ? t('document_ready_to_upload', { defaultValue: 'Document ready. Tap Upload to send.' })
            : t('pan_scan_helper', {
                defaultValue: 'Upload or capture the PAN card to detect the number automatically.',
              })}
        scannerTitle={t('upload_pan_card', { defaultValue: 'Upload or capture PAN card' })}
        containerStyle={styles.scannerContainer}
        initialImage={panInitialImage}
        disabled={uploading.panCard}
        disabledMessage={t('document_upload_in_progress', { defaultValue: 'Uploading document. Please wait…' })}
      />
      {/* {panScanMessage ? <Text style={styles.helperText}>{panScanMessage}</Text> : null}
      <InputField
        style={styles.textField}
        label={t('pan_number', { defaultValue: 'PAN Number' })}
        value={panNumber}
        autoCapitalize="characters"
        maxLength={10}
        onChangeText={text => {
          const normalized = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
          setPanNumber(normalized);
          setDriverInfo({ panNo: normalized });
          setPanScanMessage('');
        }}
        isRequired
        editable={false}
      /> */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          (!pendingImage.panCard || uploading.panCard) && styles.uploadButtonDisabled,
        ]}
        onPress={async () => {
          if (!pendingImage.panCard || uploading.panCard) {
            if (!pendingImage.panCard) {
              showNotification(
                t('pan_card', { defaultValue: 'PAN Card' }),
                t('select_document_before_upload', { defaultValue: 'Select or capture the document first.' }),
                'warning',
              );
            }
            return;
          }
          await uploadProofDocument('panCard', pendingImage.panCard);
        }}
        disabled={!pendingImage.panCard || uploading.panCard}
      >
        {uploading.panCard ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.uploadButtonText}>
            {t('upload_pan_document', { defaultValue: 'Upload PAN Document' })}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderActiveTab = () => {
    if (activeTab === 'pan') {
      return renderPanSection();
    }
    return renderAadhaarSection();
  };

  return (
    <View style={styles.container}>
      <NavBar
        title={t('proof_documents', { defaultValue: 'Proof Documents' })}
        onBackPress={() => goBack()}
      />
      <UseBackButton onBackPress={() => goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.switchContainer}>
          {switchOptions.map(option => {
            const isActive = option.id === activeTab;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.switchButton, isActive ? styles.switchButtonActive : null]}
                onPress={() => setActiveTab(option.id)}
              >
                <Text style={[styles.switchLabel, isActive ? styles.switchLabelActive : null]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.infoText}>
          {t('proof_documents_info', {
            defaultValue: 'Update either Aadhaar or PAN. Provide at least one valid document.',
          })}
        </Text>
        {renderActiveTab()}
      </ScrollView>
    </View>
  );
};

export default DriverProofDoc;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light_grey,
    borderRadius: 16,
    padding: 4,
    marginTop: 16,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  switchButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  switchLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.dark_grey,
  },
  switchLabelActive: {
    fontFamily: Fonts.medium,
    color: Colors.periwinkle,
  },
  sectionContainer: {
    marginTop: 24,
    gap: 12,
  },
  scannerContainer: {
    marginTop: 0,
  },
  textField: {
    marginBottom: 0,
  },
  helperText: {
    fontFamily: Fonts.light,
    fontSize: 12,
    color: Colors.cool_grey,
  },
  infoText: {
    marginTop: 12,
    fontFamily: Fonts.light,
    fontSize: 13,
    color: Colors.dark_grey,
  },
  uploadButton: {
    marginTop: 12,
    backgroundColor: Colors.periwinkle,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.white,
  },
});