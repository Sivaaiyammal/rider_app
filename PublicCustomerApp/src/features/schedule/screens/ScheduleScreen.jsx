import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import AdaptiveText from '../../../components/Common/AdaptiveText';
import { colors, Fonts } from '../../../constants/constants';
import DroppedTickIcon from '../../../assets/icons/DroppedTickIcon.svg';
import PaymentCashIcon from '../../../assets/icons/payments/PaymentCashIcon.svg';
import WorkIcon from '../../../assets/icons/WorkIcon.svg';
import HomeIcon from '../../../assets/icons/HomeIcon.svg';
import HatchbackIcon from '../../../assets/vehicle/HATCHBACK.webp';
import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
import ScheduleContainer from '../../../screens/SearchLocation/ScheduleContainer';
import useRideBookingInfo from '../../booking/store/useRideBookingInfo';
import useScheduleStore from '../store/useScheduleStore';
import { utils } from '../../../utils/Utils';
import AddressContainer from '../../../components/Trips/AddressContainer';

const vehicleTypeToImage = {
	AUTO: require('../../../assets/vehicle/AUTO.webp'),
	BIKE: require('../../../assets/vehicle/BIKE.webp'),
	HATCHBACK: require('../../../assets/vehicle/HATCHBACK.webp'),
	SEDAN: require('../../../assets/vehicle/SEDAN.webp'),
	SUV: require('../../../assets/vehicle/SUV.webp'),
	EXSEDAN: require('../../../assets/vehicle/ExSEDAN.webp'),
};

const vehicleTypeToLabel = {
	AUTO: 'Auto',
	BIKE: 'Bike',
	HATCHBACK: 'Hatchback',
	SEDAN: 'Sedan',
	SUV: 'SUV',
	EXSEDAN: 'Executive Sedan',
};

const ScheduleScreen = () => {
	const sheetRef = useRef(null);
	const { scheduleDateTime } = useRideBookingInfo();
	const [showScheduleContainer, setShowScheduleContainer] = useState(false);
	const schedule = useScheduleStore();

	const dateLabel = useMemo(() => {
		const isSelected = Boolean(scheduleDateTime?.date);
		const scheduleDateLabel = isSelected ? (utils.isToday(scheduleDateTime.date) ? 'Today' : utils.formatDate(scheduleDateTime.date, 'ddd DD')) : '';
		const scheduleTime = scheduleDateTime?.time ? utils.timestampTo12HourFormat(scheduleDateTime?.time) : '';
		return isSelected ? `${scheduleDateLabel} - ${scheduleTime.toUpperCase()}` : 'Thu, 02 Nov 23 - 3:00 PM';
	}, [scheduleDateTime]);

	const vehicleImage = useMemo(() => {
		return vehicleTypeToImage[schedule.vehicleType] || HatchbackIcon;
	}, [schedule.vehicleType]);

	const vehicleLabel = useMemo(() => {
		return vehicleTypeToLabel[schedule.vehicleType] || 'Hatchback';
	}, [schedule.vehicleType]);

	const fareLabel = useMemo(() => {
		if (schedule.minFare != null && schedule.maxFare != null) {
			return `₹${Math.round(schedule.minFare)}`; // show min as in design; can be range
		}
		return '₹100';
	}, [schedule.minFare, schedule.maxFare]);

	const oncloseDateTime = () => {
		setShowScheduleContainer(false);
	};
	const onConfirmDateTime = () => {
		setShowScheduleContainer(false);
	};

	return (
		<View style={styles.container}>
			<BottomSheetWrapper
				ref={sheetRef}
				index={1}
				enableScroll
				snapPoints={['40%', '85%']}
				style={styles.sheet}
			>
				{/* Success banner */}
				<View style={styles.successBanner}>
					<View style={styles.successIcon}>
						<DroppedTickIcon width={22} height={22} />
					</View>
					<View style={styles.successTextWrap}>
						<AdaptiveText style={styles.successTitle}>Your scheduled ride booked successfully</AdaptiveText>
						<AdaptiveText style={styles.successSub}>Your driver will be assigned 10 minutes before scheduled time</AdaptiveText>
					</View>
				</View>

				{/* Estimate ribbon */}
				<View style={styles.estimateWrap}>
					<AdaptiveText style={styles.estimateLabel}>Estimated amount to be paid</AdaptiveText>
					<AdaptiveText style={styles.estimateValue}>{fareLabel}</AdaptiveText>
				</View>

				{/* Vehicle card */}
				<View style={styles.vehicleCard}>
					<Image source={vehicleImage} style={styles.vehicleImg} />
					<View style={styles.vehicleMeta}>
						<AdaptiveText style={styles.vehicleName}>{vehicleLabel}</AdaptiveText>
						<AdaptiveText style={styles.vehicleSeats}>{schedule.passangerCount || 4}</AdaptiveText>
					</View>
				</View>

				{/* Date & time row */}
				<View style={styles.row}> 
					<AdaptiveText style={styles.rowLeft}>{dateLabel}</AdaptiveText>
					<TouchableOpacity onPress={() => setShowScheduleContainer(true)}>
						<AdaptiveText style={styles.link}>Change</AdaptiveText>
					</TouchableOpacity>
				</View>

				{/* From/To addresses */}
				<AddressContainer directions={schedule.stops} />

				{/* Payment method */}
				<View style={styles.row}>
					<AdaptiveText style={styles.rowLeft}>Payment Method</AdaptiveText>
					<View style={styles.rowRightPill}>
						<PaymentCashIcon width={18} height={18} />
						<AdaptiveText style={styles.pillText}>{(schedule.paymentMethod || 'CASH').charAt(0) + (schedule.paymentMethod || 'CASH').slice(1).toLowerCase()}</AdaptiveText>
					</View>
				</View>

				{/* Cancel booking */}
				<TouchableOpacity style={styles.cancelBtn}>
					<AdaptiveText style={styles.cancelText}>Cancel Booking</AdaptiveText>
				</TouchableOpacity>
			</BottomSheetWrapper>

			{showScheduleContainer && (
				<AnimatedBottomSheetWrapper onClose={oncloseDateTime}>
					<ScheduleContainer
						isUpdate={Boolean(scheduleDateTime?.date)}
						scheduleTime={scheduleDateTime?.time || new Date()}
						scheduleDate={scheduleDateTime?.date ? new Date(scheduleDateTime.date).toISOString().split('T')[0] : utils.getCurrentDate()}
						oncloseDateTime={oncloseDateTime}
						onConfirmDateTime={onConfirmDateTime}
					/>
				</AnimatedBottomSheetWrapper>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	sheet: {
		backgroundColor: colors.white,
        paddingHorizontal:10
	},
    container: {
        flex: 1,
    },
	successBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: colors.white,
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.grey_light,
		marginTop: 6,
	},
	successIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.green_xlight,
	},
	successTextWrap: { flex: 1 },
	successTitle: {
		fontFamily: Fonts.semi_bold,
		fontSize: 14,
		color: colors.black,
	},
	successSub: {
		fontFamily: Fonts.light,
		fontSize: 12,
		color: colors.grey_xxdark,
	},
	estimateWrap: {
		marginTop: 12,
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: colors.yellow_xxlight,
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: colors.yellow_light,
	},
	estimateLabel: {
		fontFamily: Fonts.regular,
		fontSize: 13,
		color: colors.black,
	},
	estimateValue: {
		fontFamily: Fonts.bold,
		fontSize: 18,
		color: colors.black,
	},
	vehicleCard: {
		marginTop: 12,
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.grey_light,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	vehicleImg: { width: 80, height: 48 },
	vehicleMeta: { flex: 1 },
	vehicleName: { fontFamily: Fonts.semi_bold, fontSize: 14, color: colors.blue_xxdark },
	vehicleSeats: { fontFamily: Fonts.regular, fontSize: 12, color: colors.grey_xxdark, marginTop: 2 },
	row: {
		marginTop: 12,
		paddingVertical: 14,
		paddingHorizontal: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.grey_light,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	rowLeft: { fontFamily: Fonts.semi_bold, fontSize: 14, color: colors.black },
	link: { fontFamily: Fonts.semi_bold, fontSize: 13, color: colors.blue },
	addrCard: {
		marginTop: 12,
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.grey_light,
		gap: 10,
	},
	addrRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	addrTextWrap: { flex: 1 },
	addrTitle: { fontFamily: Fonts.semi_bold, fontSize: 14, color: colors.black },
	addrSub: { fontFamily: Fonts.regular, fontSize: 12, color: colors.grey_xxdark },
	addrDivider: { height: 1, backgroundColor: colors.grey_light, marginVertical: 6 },
	rowRightPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: colors.white_dirt,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 16,
	},
	pillText: { fontFamily: Fonts.semi_bold, fontSize: 12, color: colors.black },
	cancelBtn: {
		marginTop: 16,
		backgroundColor: colors.cance_red,
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
	},
	cancelText: { fontFamily: Fonts.semi_bold, fontSize: 15, color: colors.white },
});

export default ScheduleScreen;
