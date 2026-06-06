import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, BackHandler, Modal, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import AdaptiveText from '../../../components/Common/AdaptiveText';
import { colors, Fonts } from '../../../constants/constants';
// removed unused tick and cash icon imports
import PropTypes from 'prop-types';
import ScheduleImage from '../../../assets/image/scheduleImage.webp';
import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
import ScheduleContainer from '../../../screens/SearchLocation/ScheduleContainer';
import useRideBookingInfo from '../../booking/store/useRideBookingInfo';
import { utils } from '../../../utils/Utils';
import moment from 'moment';
import AddressContainer from '../../../components/Trips/AddressContainer';
import Icon from 'react-native-vector-icons/Ionicons';
import VehicleDriverPreview from '../../../components/Common/VehicleDriverPreview';
import CancelComponent from '../../rideStatus/component/CancelComponent';
import { cancelRide } from '../../../API/EndPoints/EndPoints';
import { showNotification } from '../../../components/NotificationManger';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import useScheduleTripStore from '../../../store/useScheduleTripStore';
import { TripStatus } from '../../rideStatus/types/TripStatus';
import { useTranslation } from 'react-i18next';

const ScheduleScreen = ({ trip, fromBookScreen=false }) => {
	const sheetRef = useRef(null);
	const { scheduleDateTime } = useRideBookingInfo();
	const [showScheduleContainer, setShowScheduleContainer] = useState(false);
	const [showCancelBottomSheet, setShowCancelBottomSheet] = useState(false);
	const [cancelLoading, setCancelLoading] = useState(false);
	const { t } = useTranslation();
	const { goBack, reset } = useStackScreenStore();
	const { removeScheduledTrip } = useScheduleTripStore();
	const [schedule, setSchedule] = useState(trip || {});
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	const [pendingRangeStart, setPendingRangeStart] = useState(null);
	const [pendingRangeEnd, setPendingRangeEnd] = useState(null);

	useEffect(() => {
		if (trip) {
			setSchedule(trip);
		}
	}, [trip]);

	const formatCalendarDate = (d) => {
		const year = d.getFullYear();
		const month = `${d.getMonth() + 1}`.padStart(2, '0');
		const day = `${d.getDate()}`.padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const getInclusiveDateRangeDays = (startStr, endStr) => {
		if (!startStr) return 0;
		const sDate = new Date(startStr);
		const eDate = new Date(endStr || startStr);
		sDate.setHours(0, 0, 0, 0);
		eDate.setHours(0, 0, 0, 0);
		const dayMs = 24 * 60 * 60 * 1000;
		return Math.max(1, Math.floor((eDate - sDate) / dayMs) + 1);
	};

	const addMonths = (d, months) => {
		const nextDate = new Date(d);
		nextDate.setMonth(nextDate.getMonth() + months);
		return nextDate;
	};

	const todayDate = formatCalendarDate(new Date());
	const maxCustomDate = formatCalendarDate(addMonths(new Date(), 2));

	const getMarkedDates = () => {
		if (!pendingRangeStart) {
			return {};
		}
		const start = new Date(pendingRangeStart);
		const end = new Date(pendingRangeEnd || pendingRangeStart);
		start.setHours(0, 0, 0, 0);
		end.setHours(0, 0, 0, 0);
		const marked = {};
		const cursor = new Date(start);
		while (cursor <= end) {
			const dateKey = formatCalendarDate(cursor);
			marked[dateKey] = {
				selected: true,
				color: colors.black,
				textColor: colors.white,
				startingDay: dateKey === pendingRangeStart,
				endingDay: dateKey === (pendingRangeEnd || pendingRangeStart),
			};
			cursor.setDate(cursor.getDate() + 1);
		}
		return marked;
	};

	const onCustomDurationDateSelect = (day) => {
		const selectedDate = day.dateString;
		if (!pendingRangeStart || (pendingRangeStart && pendingRangeEnd)) {
			setPendingRangeStart(selectedDate);
			setPendingRangeEnd(null);
			return;
		}
		if (selectedDate < pendingRangeStart) {
			setPendingRangeStart(selectedDate);
			setPendingRangeEnd(null);
			return;
		}
		setPendingRangeEnd(selectedDate);
	};

	const onCustomCalendarConfirm = () => {
		if (!pendingRangeStart) {
			return;
		}
		const originalTime = new Date(schedule.scheduleDateTime);
		const newStart = new Date(pendingRangeStart);
		newStart.setHours(originalTime.getHours());
		newStart.setMinutes(originalTime.getMinutes());
		newStart.setSeconds(0);
		newStart.setMilliseconds(0);
		
		const days = getInclusiveDateRangeDays(pendingRangeStart, pendingRangeEnd || pendingRangeStart);
		
		setSchedule(prev => ({
			...prev,
			scheduleDateTime: newStart.getTime(),
			actingDriverHours: days * 24
		}));
		
		setShowCalendarModal(false);
	};

	const onCustomCalendarCancel = () => {
		setPendingRangeStart(null);
		setPendingRangeEnd(null);
		setShowCalendarModal(false);
	};



	const onBackPress = () => {
		if(fromBookScreen){
			reset();
		}else{
			goBack();
		}
	};

	useEffect(() => {
		const handleHardwareBackPress = () => {
		  onBackPress();
		  return true;
		};
		const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBackPress);
		return () => {
		  subscription.remove();
		};
	  }, [onBackPress]);

// date label is directly formatted where needed


	const fareRangeLabel = useMemo(() => {
		const hasMin = schedule.minFare != null;
		const hasMax = schedule.maxFare != null;
		if (hasMin && hasMax) return `₹${Math.round(schedule.minFare)} - ₹${Math.round(schedule.maxFare)}`;
		if (hasMin) return `₹${Math.round(schedule.minFare)}`;
		return '₹0';
	}, [schedule.minFare, schedule.maxFare]);

	const timeDistanceLabel = useMemo(() => {
		const mins = schedule.estimatedDuration || 0;
		const distance = Number(schedule.estimatedDistance || 0);
		const minsLabel = utils.formatMinutesToReadable(mins).replace('Mins', 'Min');
		return `${minsLabel}  .  ${distance.toFixed(1)} Km`;
	}, [schedule.estimatedDuration, schedule.estimatedDistance]);

	const scheduleDateLabel = useMemo(() => {
		if (!schedule.scheduleDateTime) return '';
		
		let ms = schedule.scheduleDateTime;
		if (typeof ms === 'number' && ms < 1e12) {
			ms = ms * 1000;
		}
		
		if (schedule.isActingDriverTrip && schedule.actingDriverHours) {
			const start = moment(ms);
			const durationMs = schedule.actingDriverHours * 60 * 60 * 1000;
			const end = moment(ms + durationMs);
			
			if (schedule.actingDriverHours >= 24) {
				const days = Math.round(schedule.actingDriverHours / 24);
				return `${start.format('DD MMM YY')} - ${end.format('DD MMM YY')} . ${start.format('hh:mm A')} (${days} ${days > 1 ? 'Days' : 'Day'})`;
			} else {
				return `${start.format('DD MMM YY')} . ${start.format('hh:mm A')} (${schedule.actingDriverHours} ${schedule.actingDriverHours > 1 ? 'Hours' : 'Hour'})`;
			}
		}
		
		return utils.formatScheduleDateTimeLabel(schedule.scheduleDateTime);
	}, [schedule.scheduleDateTime, schedule.actingDriverHours, schedule.isActingDriverTrip]);

	const oncloseDateTime = () => {
		setShowScheduleContainer(false);
	};
	const onConfirmDateTime = () => {
		setShowScheduleContainer(false);
		if (scheduleDateTime) {
			const combined = new Date(scheduleDateTime.date);
			const t = new Date(scheduleDateTime.time);
			combined.setHours(t.getHours());
			combined.setMinutes(t.getMinutes());
			combined.setSeconds(0);
			combined.setMilliseconds(0);
			
			setSchedule(prev => ({
				...prev,
				scheduleDateTime: combined.getTime()
			}));
		}
	};

	const handleCancel = async (reason) => {
		if (!schedule?._id) {
			showNotification(t('error') || 'Error', t('invalid_trip_id') || 'Invalid trip ID', 'danger');
			return;
		}

		setCancelLoading(true);
		try {
			const payload = {
				tripId: schedule.tripId || schedule._id,
				reason: reason,
			};
			const response = await cancelRide(payload);
			
			if (response.success) {
				showNotification(t('ride_cancelled') || 'Ride cancelled successfully');
				// Remove from scheduled trips store
				removeScheduledTrip( schedule._id);
				setShowCancelBottomSheet(false);
				onBackPress();
			} else {
				showNotification(t('failed_to_cancel_ride') || 'Failed to cancel ride', response.message || '', 'danger');
			}
		} catch (error) {
			console.error('Error cancelling scheduled ride:', error);
			showNotification(t('failed_to_cancel_ride') || 'Failed to cancel ride', t('please_try_again') || 'Please try again', 'danger');
		} finally {
			setCancelLoading(false);
		}
		
	};

	const isActingDriver = Boolean(schedule?.isActingDriverTrip);

	// For acting driver trips the vehicle is the CUSTOMER's vehicle, stored in vehicleData / passangerVehicleType
	const vehicleType = isActingDriver
		? (schedule?.vehicleData?.type || schedule?.passangerVehicleType || 'AUTO')
		: (schedule?.vehicleType || 'AUTO');
	const isElectricVehicle =
		vehicleType === 'ELECTRIC_AUTO' || vehicleType === 'ELECTRIC_BIKE' || vehicleType === 'ELECTRIC_HATCHBACK' || vehicleType === 'ELECTRIC_SEDAN' || vehicleType === 'ELECTRIC_SUV' || vehicleType === 'ELECTRIC_EXSEDAN';
	const DriverImageSource = schedule?.driverData?.driverPhoto || schedule?.driver?.photo || null;

	// Passenger vehicle details (acting driver)
	const passengerVehicleBrand = schedule?.vehicleData?.make || '';
	const passengerVehicleModel = schedule?.vehicleData?.model || '';
	const passengerVehicleRegNo = schedule?.vehicleData?.regNo || '';
	const passengerVehicleColor = schedule?.vehicleData?.color || '';

	// Itinerary from trip object
	const [itineraryExpanded, setItineraryExpanded] = useState(true);
	const actingDriverItinerary = schedule?.actingDriverItinerary || {};
	const itineraryEntries = Object.entries(actingDriverItinerary);

	const formatItinTime = (dateStr) => {
		if (!dateStr) return 'Any time';
		const d = new Date(dateStr);
		let h = d.getHours();
		const m = d.getMinutes().toString().padStart(2, '0');
		const ampm = h >= 12 ? 'PM' : 'AM';
		h = h % 12 || 12;
		return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
	};

	const formatItinDate = (dateStr) => {
		if (!dateStr) return '';
		const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		const d = new Date(dateStr);
		return `${d.getDate()} ${months[d.getMonth()]}`;
	};
	return (
		<View style={styles.container}>
			<BottomSheetWrapper
				ref={sheetRef}
				index={1}
				enableScroll
				snapPoints={['40%', '100%']}
				style={styles.sheet}
			>
				{/* Header */}
				<View style={styles.headerWrap}>
					<Image source={ScheduleImage} style={styles.calendarImg} resizeMode="contain" />
					{isActingDriver && (
						<View style={styles.actingDriverBadge}>
							<Icon name="car-sport-outline" size={14} color="#7E1CFC" />
							<Text style={styles.actingDriverBadgeText}>Acting Driver Booking</Text>
						</View>
					)}
					<AdaptiveText style={styles.headerTitle}>
						{fromBookScreen
							? (isActingDriver ? 'Acting Driver Booked Successfully' : 'Scheduled Ride Booked Successfully')
							: (isActingDriver ? 'Acting Driver Booking' : 'Scheduled Ride')}
					</AdaptiveText>
					<AdaptiveText style={styles.headerSub}>Your driver will be assigned 10 minutes before scheduled time</AdaptiveText>
				</View>
				<View style={styles.dashedDivider} />

				<View style={styles.estimateBlock}>
					<AdaptiveText style={styles.estimateTitle}>Estimated Amount to Pay (Price may vary)</AdaptiveText>
					<AdaptiveText style={styles.estimatePrice}>{fareRangeLabel}</AdaptiveText>
					<View style={styles.timeDistancePill}>
						<AdaptiveText style={styles.timeDistanceText}>{timeDistanceLabel}</AdaptiveText>
					</View>
				</View>

				<View style={styles.cardsRow}>
					{/* Vehicle card */}
					<View style={[styles.tileCard, { marginRight: 10, alignItems: 'center', justifyContent: 'center' }]}>
						<VehicleDriverPreview
							vehicleType={vehicleType}
							driverPhoto={DriverImageSource}
							isElectricVehicle={isElectricVehicle}
						/>
						{isActingDriver && (passengerVehicleBrand || passengerVehicleModel || passengerVehicleRegNo) && (
							<View style={styles.vehicleInfoBlock}>
								{(passengerVehicleBrand || passengerVehicleModel) ? (
									<Text style={styles.vehicleInfoPrimary}>{[passengerVehicleBrand, passengerVehicleModel].filter(Boolean).join(' ')}</Text>
								) : null}
								{passengerVehicleRegNo ? (
									<Text style={styles.vehicleInfoRegNo}>{passengerVehicleRegNo}</Text>
								) : null}
								{passengerVehicleColor ? (
									<Text style={styles.vehicleInfoColor}>{passengerVehicleColor}</Text>
								) : null}
							</View>
						)}
					</View>
					{/* Date/time card */}
					<View style={styles.tileCard}>
						<View style={{ flexDirection: 'column', alignItems: 'center', flex: 1, gap: 10 }}>
							<Icon name="time-outline" color={colors.black} size={40} />
							<AdaptiveText style={[styles.rowLeft, { marginLeft: 8, textAlign: 'center' }]}>{scheduleDateLabel}</AdaptiveText>
						</View>
					</View>
				</View>

				{/* Date & time row */}
				<View style={styles.row}> 
					<Icon name="time-outline" color="black" size={20} />
					<AdaptiveText style={styles.rowLeft}>{scheduleDateLabel}</AdaptiveText>
					 <TouchableOpacity onPress={() => {
						if (schedule.isActingDriverTrip) {
							let startStr = null;
							let endStr = null;
							if (schedule.scheduleDateTime) {
								const start = new Date(schedule.scheduleDateTime);
								startStr = formatCalendarDate(start);
								if (schedule.actingDriverHours) {
									const end = new Date(schedule.scheduleDateTime + schedule.actingDriverHours * 60 * 60 * 1000);
									endStr = formatCalendarDate(end);
								}
							}
							setPendingRangeStart(startStr);
							setPendingRangeEnd(endStr);
							setShowCalendarModal(true);
						} else {
							setShowScheduleContainer(true);
						}
					 }}>
						<AdaptiveText style={styles.link}><Icon name="create-outline" color="blue" size={20} /></AdaptiveText>
					</TouchableOpacity> 	
				</View>

			

			{/* From/To addresses */}
			<AddressContainer directions={schedule.stops || []} bg={colors.white} />

			{/* Itinerary Plan — shown only for acting driver trips with itinerary */}
			{isActingDriver && itineraryEntries.length > 0 && (
				<View style={styles.itinerarySection}>
					<TouchableOpacity
						style={styles.itinerarySectionHeader}
						onPress={() => setItineraryExpanded(prev => !prev)}
						activeOpacity={0.7}
					>
						<View style={styles.itinerarySectionHeaderLeft}>
							<View style={styles.itineraryIconWrap}>
								<Icon name="map-outline" size={16} color="#7E1CFC" />
							</View>
							<Text style={styles.itinerarySectionTitle}>Itinerary Plan</Text>
						</View>
						<Icon name={itineraryExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.grey_xxdark} />
					</TouchableOpacity>

					{itineraryExpanded && (
						<View style={styles.itineraryBody}>
							{itineraryEntries.map(([dateStr, dayData], dayIndex) => {
								const locations = dayData?.locations || [];
								return (
									<View key={dateStr} style={styles.itineraryDayCard}>
										<View style={styles.itineraryDayHeader}>
											<View style={styles.itineraryDayBadge}>
												<Text style={styles.itineraryDayBadgeText}>{dayIndex + 1}</Text>
											</View>
											<Text style={styles.itineraryDayTitle}>
												Day {dayIndex + 1}
												<Text style={styles.itineraryDayDate}> ({formatItinDate(dateStr)})</Text>
											</Text>
										</View>
										{locations.length === 0 ? (
											<Text style={styles.itineraryNoLoc}>No locations added</Text>
										) : (
											locations.map((loc, locIdx) => (
												<View key={locIdx} style={styles.itineraryLocRow}>
													<Icon name="location-outline" size={14} color="#7E1CFC" />
													<Text style={styles.itineraryLocText} numberOfLines={1}>{loc.name || loc.address}</Text>
													<Text style={styles.itineraryLocTime}>{formatItinTime(loc.time)}</Text>
												</View>
											))
										)}
									</View>
								);
							})}
						</View>
					)}
				</View>
			)}

				{/* Payment method */}
				<View style={[styles.row, { justifyContent: 'space-between' }]}>
					<AdaptiveText style={styles.rowLeft}>Payment Method</AdaptiveText>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
						<AdaptiveText style={styles.pillText}>{(schedule.paymentMethod || 'CASH').charAt(0) + (schedule.paymentMethod || 'CASH').slice(1).toLowerCase()}</AdaptiveText>
						<Icon name="chevron-forward" size={18} color={colors.grey_xxdark} />
					</View>
				</View>

				{/* Cancel booking */}
				<TouchableOpacity 
					style={styles.cancelBtn}
					onPress={() => setShowCancelBottomSheet(true)}
				>
					<AdaptiveText style={styles.cancelText}>Cancel Booking</AdaptiveText>
				</TouchableOpacity>

				<TouchableOpacity 
					style={styles.backBtn}
					onPress={onBackPress}
				>
					<AdaptiveText style={styles.backText}>{fromBookScreen ? 'Go to Home' : 'Go Back'}</AdaptiveText>
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
			{showCancelBottomSheet && (
				<AnimatedBottomSheetWrapper onClose={() => setShowCancelBottomSheet(false)}>
					<CancelComponent 
						onClose={() => setShowCancelBottomSheet(false)} 
						onCancel={handleCancel}
						loading={false}
						cancelLoading={cancelLoading}
						rideStatus={TripStatus.PENDING}
					/>
				</AnimatedBottomSheetWrapper>
			)}

			<Modal
				visible={showCalendarModal}
				animationType="fade"
				transparent
				onRequestClose={onCustomCalendarCancel}
			>
				<View style={styles.calendarModalOverlay}>
					<View style={styles.calendarModalCard}>
						<Text style={styles.calendarModalTitle}>Pick Dates</Text>
						<Calendar
							minDate={todayDate}
							maxDate={maxCustomDate}
							onDayPress={onCustomDurationDateSelect}
							markingType="period"
							markedDates={getMarkedDates()}
							theme={{
								calendarBackground: colors.white,
								textSectionTitleColor: colors.grey_xxdark,
								todayTextColor: colors.black,
								dayTextColor: colors.black,
								textDayFontFamily: Fonts.regular,
								textMonthFontFamily: Fonts.medium,
								arrowColor: colors.black,
							}}
						/>
						<View style={styles.calendarModalActions}>
							<TouchableOpacity 
								style={styles.calendarCancelButton}
								onPress={onCustomCalendarCancel}
							>
								<Text style={styles.calendarCancelText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity 
								style={[styles.calendarOkButton, !pendingRangeStart && styles.calendarOkButtonDisabled]}
								onPress={onCustomCalendarConfirm}
							>
								<Text style={styles.calendarOkText}>OK</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	sheet: {
		backgroundColor: colors.white,
		paddingHorizontal: 10,
	},
	container: {
		flex: 1,
	},
	actingDriverBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: '#F3E8FF',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 20,
		marginBottom: 6,
	},
	actingDriverBadgeText: {
		fontFamily: Fonts.semi_bold,
		fontSize: 11,
		color: '#7E1CFC',
	},
	vehicleInfoBlock: {
		alignItems: 'center',
		marginTop: 6,
		gap: 2,
	},
	vehicleInfoPrimary: {
		fontFamily: Fonts.semi_bold,
		fontSize: 12,
		color: colors.black,
		textAlign: 'center',
	},
	vehicleInfoRegNo: {
		fontFamily: Fonts.bold,
		fontSize: 13,
		color: '#7E1CFC',
		letterSpacing: 0.5,
	},
	vehicleInfoColor: {
		fontFamily: Fonts.regular,
		fontSize: 11,
		color: colors.grey_xxdark,
	},
	// Itinerary Section
	itinerarySection: {
		marginTop: 12,
		backgroundColor: colors.white,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E9D5FF',
		overflow: 'hidden',
	},
	itinerarySectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: '#FAF5FF',
	},
	itinerarySectionHeaderLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	itineraryIconWrap: {
		width: 28,
		height: 28,
		borderRadius: 8,
		backgroundColor: '#EDE9FE',
		alignItems: 'center',
		justifyContent: 'center',
	},
	itinerarySectionTitle: {
		fontFamily: Fonts.bold,
		fontSize: 14,
		color: '#5B21B6',
	},
	itineraryBody: {
		paddingHorizontal: 14,
		paddingBottom: 14,
		gap: 12,
		paddingTop: 10,
	},
	itineraryDayCard: {
		backgroundColor: '#FAFAFA',
		borderRadius: 10,
		padding: 12,
		borderWidth: 1,
		borderColor: '#EDE9FE',
	},
	itineraryDayHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#EDE9FE',
	},
	itineraryDayBadge: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#7E1CFC',
		alignItems: 'center',
		justifyContent: 'center',
	},
	itineraryDayBadgeText: {
		color: '#fff',
		fontFamily: Fonts.bold,
		fontSize: 12,
	},
	itineraryDayTitle: {
		fontFamily: Fonts.bold,
		fontSize: 13,
		color: '#5B21B6',
	},
	itineraryDayDate: {
		fontFamily: Fonts.medium,
		fontSize: 11,
		color: colors.grey_xxdark,
	},
	itineraryNoLoc: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		color: colors.grey_xxdark,
		fontStyle: 'italic',
		paddingLeft: 4,
	},
	itineraryLocRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingVertical: 6,
		paddingHorizontal: 4,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	itineraryLocText: {
		flex: 1,
		fontFamily: Fonts.medium,
		fontSize: 13,
		color: colors.black,
	},
	itineraryLocTime: {
		fontFamily: Fonts.bold,
		fontSize: 11,
		color: '#7E1CFC',
	},
	headerWrap: {
		alignItems: 'center',
		marginTop: 20,
	},
	calendarImg: { width: 64, height: 64 },
	headerTitle: {
		fontFamily: Fonts.semi_bold,
		fontSize: 16,
		color: colors.black,
		marginTop: 8,
		textAlign: 'center',
	},
	headerSub: {
		fontFamily: Fonts.light,
		fontSize: 12,
		color: colors.grey_xxdark,
		marginTop: 4,
		textAlign: 'center',
	},
	dashedDivider: {
		marginTop: 10,
		borderTopWidth: 1,
		borderStyle: 'dashed',
		borderColor: colors.grey_light,
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
		estimateBlock: {
			marginTop: 12,
			alignItems: 'center',
		},
		estimateTitle: {
			fontFamily: Fonts.regular,
			fontSize: 12,
			color: colors.grey_xxdark,
		},
		estimatePrice: {
			fontFamily: Fonts.bold,
			fontSize: 24,
			color: colors.green,
			marginTop: 6,
		},
		timeDistancePill: {
			marginTop: 10,
			borderWidth: 1,
			borderColor: colors.grey_light,
			borderRadius: 18,
			paddingHorizontal: 12,
			paddingVertical: 6,
			backgroundColor: colors.white,
		},
		timeDistanceText: {
			fontFamily: Fonts.semi_bold,
			fontSize: 13,
			color: colors.black,
		},
		cardsRow: { flexDirection: 'row', marginTop: 12 },
		tileCard: {
			flex: 1,
			padding: 12,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: colors.grey_light,
			backgroundColor: colors.white,
			justifyContent: 'center',
			alignItems: 'center',
		},
	vehicleImg: { width: 80, height: 60, marginRight: 10 },
	vehicleMeta: { flex: 1, alignItems: 'flex-end' },
	vehicleName: { fontFamily: Fonts.semi_bold, fontSize: 14, color: colors.blue_xxdark },
		vehicleSeats: { fontFamily: Fonts.regular, fontSize: 12, color: colors.grey_xxdark, marginLeft: 6 },
	row: {
		marginTop: 12,
		paddingVertical: 14,
		paddingHorizontal: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.grey_light,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
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
	backBtn: {
		marginTop: 10,
		backgroundColor: colors.grey_xdark,
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
	},
	backText: { fontFamily: Fonts.semi_bold, fontSize: 15, color: colors.black },
	cancelText: { fontFamily: Fonts.semi_bold, fontSize: 15, color: colors.white },
	calendarModalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	calendarModalCard: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		width: '90%',
		maxWidth: 400,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	calendarModalTitle: {
		fontFamily: Fonts.bold,
		fontSize: 18,
		marginBottom: 16,
		textAlign: 'center',
		color: '#000',
	},
	calendarModalActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 12,
		marginTop: 16,
	},
	calendarCancelButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	calendarCancelText: {
		fontFamily: Fonts.medium,
		color: colors.grey_xxdark,
		fontSize: 14,
	},
	calendarOkButton: {
		backgroundColor: colors.black,
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	calendarOkButtonDisabled: {
		opacity: 0.5,
	},
	calendarOkText: {
		fontFamily: Fonts.medium,
		color: '#fff',
		fontSize: 14,
	},
});

export default ScheduleScreen;

ScheduleScreen.propTypes = {
	trip: PropTypes.object,
	fromBookScreen: PropTypes.bool,
};

