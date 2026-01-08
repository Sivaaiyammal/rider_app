import React, {useMemo} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';

import {useStackScreenStore} from '../../../common/store/useStackScreenStore';
import usePublicDriverStore from '../../store/usePublicDriverStore';
import UseBackButton from '../../../common/hooks/UseBackButton';
import {Colors, Fonts} from '../../../common/constants/constants';

const DocumentCenter = () => {
  const {t} = useTranslation();
  const {goBack, setStackScreen} = useStackScreenStore();
  const driverInfo = usePublicDriverStore(state => state.driverInfo);
  const vehicleInfo = usePublicDriverStore(state => state.vehicleInfo);
  const bankInfo = usePublicDriverStore(state => state.bankInfo);
  const documents = usePublicDriverStore(state => state.documents);

const {
  locationCompleteStatus,
  driverDetailsCompleteStatus,
  vehicleDetailsCompleteStatus,
  bankDetailsCompleteStatus,
  documentsCompleteStatus,
} = usePublicDriverStore();

  const onBackPress = () => {
    goBack();
  };

//   const locationComplete = Boolean(driverInfo?.homeLocation);
//   const driverDetailsComplete = Boolean(
//     driverInfo?.name && driverInfo?.phone && driverInfo?.gender && driverInfo?.licenseNo && driverInfo?.dob && driverInfo?.driverPhoto && driverInfo?.licenseDocument,
//   );
//   const vehicleDetailsComplete = Boolean(vehicleInfo?.regNo && vehicleInfo?.type && vehicleInfo?.vehicleRcDoc);
//   const bankDetailsComplete = Boolean(
//     bankInfo?.accountHolderName && bankInfo?.accountNumber && bankInfo?.ifscCode,
//   );
//   const documentsComplete = useMemo(() => {
//     if (!documents || documents.length === 0) {
//       return false;
//     }
//     return documents
//       .filter(item => item.required)
//       .every(item => item.status === 'uploaded' || item.status === 'verified');
//   }, [documents]);

//   const allStepsComplete = useMemo(
//     () =>
//       locationComplete &&
//       driverDetailsComplete &&
//       vehicleDetailsComplete &&
//       bankDetailsComplete &&
//       documentsComplete,
//     [
//       locationComplete,
//       driverDetailsComplete,
//       vehicleDetailsComplete,
//       bankDetailsComplete,
//       documentsComplete,
//     ],
//   );

    const docCompleted =  locationCompleteStatus &&
  driverDetailsCompleteStatus &&
  vehicleDetailsCompleteStatus &&
  bankDetailsCompleteStatus &&
  documentsCompleteStatus

  const sections = [
      {
        id: 'preferredLocation',
        title: t('preferred_work_location'),
        // description: t('document_center_location_desc', {
        //   defaultValue: 'Choose your preferred work locations.',
        // }),
        icon: 'place',
        screen: 'AddDriverLocation',
        complete: locationCompleteStatus,
      },
      {
        id: 'driverDetails',
        title: t('driver_details', {defaultValue: 'Driver Details'}),
        // description: t('document_center_driver_desc', {
        //   defaultValue: 'Review and update your personal information.',
        // }),
        icon: 'person',
        screen: 'DriverEntry',
        complete: driverDetailsCompleteStatus,
      },
      {
        id: 'vehicleDetails',
        title: t('vehicle_details'),
        // description: t('document_center_vehicle_desc', {
        //   defaultValue: 'Confirm your assigned vehicle information.',
        // }),
        icon: 'directions-car',
        screen: 'DriverVehicleEntry',
        complete: vehicleDetailsCompleteStatus,
      },
      {
        id: 'bankDetails',
        title: t('bank_details', {defaultValue: 'Bank Details'}),
        // description: t('document_center_bank_desc', {
        //   defaultValue: 'Verify the bank account for your payouts.',
        // }),
        icon: 'account-balance',
        screen: 'DriverBankDetails',
        complete: bankDetailsCompleteStatus,
      },
      {
        id: 'proofDocuments',
        title: t('proof_documents'),
        // description: t('document_center_proof_desc', {
        //   defaultValue: 'Upload and check the status of your documents.',
        // }),
        icon: 'fact-check',
        screen: 'DriverProofDoc',
        complete: documentsCompleteStatus,
      },
    ]

  const handleSectionPress = screen => {
    if (!screen) {
      return;
    }
    setStackScreen(screen);
  };

  const renderStatus = complete => (
    <View
      style={[
        styles.statusBadge,
        complete ? styles.statusBadgeComplete : styles.statusBadgePending,
      ]}>
      <Text
        style={[
          styles.statusText,
          complete ? styles.statusTextComplete : styles.statusTextPending,
        ]}>
        {complete
          ? t('complete', {defaultValue: 'Complete'})
          : t('pending', {defaultValue: 'Pending'})}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('document_center', {defaultValue: 'Document Center'})}</Text>
      <UseBackButton onBackPress={onBackPress} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* {allStepsComplete ? (
          <View style={styles.approvalBanner}>
            <MaterialIcons name="hourglass-top" size={20} color={Colors.periwinkle} />
            <Text style={styles.approvalBannerText}>
              {t('waiting_for_approval', {defaultValue: 'Waiting for approval'})}
            </Text>
          </View>
        ) : null} */}
        <Text style={styles.subtitle}>
          {t('document_center_subtitle', {
            defaultValue: 'Finish these steps so you can start accepting rides.',
          })}
        </Text>
        <View style={styles.sectionsContainer}>
          {sections.map(section => (
            <TouchableOpacity
              key={section.id}
              activeOpacity={0.8}
              style={styles.sectionCard}
              onPress={() => handleSectionPress(section.screen)}>
              <View style={styles.iconWrapper}>
                <MaterialIcons name={section.icon} size={24} color={Colors.white} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.id === "preferredLocation" && <Text style={styles.sectionDescription}>{driverInfo?.homeLocation?.addressName}</Text> }
              </View>
              <View style={styles.sectionMeta}>
                {renderStatus(section.complete)}
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={Colors.warm_grey}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneButton, !docCompleted && styles.doneButtonDisabled]}
          onPress={goBack}
          activeOpacity={0.8}
          disabled={!docCompleted}
        >
          <Text style={styles.doneButtonText}>{t('done', {defaultValue: 'Done'})}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DocumentCenter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  subtitle: {
    marginTop: 24,
    marginBottom: 16,
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.dark_grey,
  },
  sectionsContainer: {
    gap: 12,
  },
  approvalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white_dirt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.periwinkle,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  approvalBannerText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.periwinkle,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.periwinkle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: Colors.black,
  },
  sectionDescription: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.warm_grey,
    marginTop: 4,
  },
  sectionMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBadgeComplete: {
    backgroundColor: '#E3F4E6',
  },
  statusBadgePending: {
    backgroundColor: '#FCE6E6',
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statusTextComplete: {
    color: Colors.green,
  },
  statusTextPending: {
    color: Colors.scarlet,
  },
  title:{
    fontFamily: Fonts.semi_bold,
    fontSize: 20,
    color: Colors.black,
    marginTop:16,
    marginLeft:16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.grey_light,
    padding: 16,
    backgroundColor: Colors.white,
  },
  doneButton: {
    backgroundColor: Colors.periwinkle,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonDisabled: {
    opacity: 0.6,
  },
  doneButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.white,
  },
});