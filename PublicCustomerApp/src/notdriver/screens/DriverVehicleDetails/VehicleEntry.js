import {Text, TouchableOpacity, View, ActivityIndicator, Modal, ScrollView, TextInput, Alert} from 'react-native';
import React, {useState, useEffect, useCallback, useMemo,useContext} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import usePublicDriverStore from '../../store/usePublicDriverStore';
import { carColorList, indianAutoRickshawBrands, indianBikeBrands, indianElectricAutoRickshawBrands, indianElectricHatchbackBrands, indianElectricSedanBrands, indianElectricSUVBrands, indianHatchbackBrands, indianSedanBrands, indianSUVBrands, vehicleList } from '../../../common/constants/jsonData';
import useUserStore from '../../../common/store/useUserStore';
import APIRequest from '../../../common/controllers/APIRequest';
import { showNotification } from '../../../common/components/Alerts/showNotification';
import { Colors, Fonts, vehicleNumberPattern } from '../../../common/constants/constants';
import publicrideDriverApi from '../../api/publicrideDriverApi';
import { styles } from '../../styles/vehicleEntryStyles';
import InputField from '../../../common/components/InputField';
import { driverDetailStyles } from '../../styles/DriverDetailsUpload';
import { useTranslation } from 'react-i18next';

function getFormattedDate(timestamp) {
  if (!timestamp) return null;
  
  try {
    const newTimestamp = parseInt(timestamp);
    if (isNaN(newTimestamp)) return null;
    
    const date = new Date(newTimestamp);
    if (isNaN(date.getTime())) return null;
    
    const formatted = date.toISOString().split('T')[0];
    return formatted;
  } catch (error) {
    console.warn('Invalid timestamp:', timestamp);
    return null;
  }
}

  const roadTaxExpiryLifetime = [{
    id:1,
    name:'Lifetime',
    value:'lifetime',
  },{
    id:2,
    name:'Expiry Date',
    value:'expiry_date',
  }]

const VehicleEntry = ({onNext}) => {
  const {t} = useTranslation()
  const {setVehicleInfo, vehicleInfo} = usePublicDriverStore();
  const [selected, setSelected] = useState(vehicleList?.find(item => item?.name === vehicleInfo.type)?.name || null);
  const {userInfo} = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [brandPickerVisible, setBrandPickerVisible] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const [insuranceExpiryPickerVisible, setInsuranceExpiryPickerVisible] = useState(false);
  const [roadTaxExpiryPickerVisible, setRoadTaxExpiryPickerVisible] = useState(false);
  const [fitnessExpiryPickerVisible, setFitnessExpiryPickerVisible] = useState(false);
  const [pucExpiryPickerVisible, setPucExpiryPickerVisible] = useState(false);
  const [fuelTypePickerVisible, setFuelTypePickerVisible] = useState(false);

  const [regNum, setRegNum] = useState(vehicleInfo.regNo || '');
  const [vehicleBrand, setVehicleBrand] = useState(vehicleInfo.make || '');
  const [vehicleModal, setVehicleModal]= useState(vehicleInfo.model || '');
  const [manufactureYear, setManufactureYear] = useState(vehicleInfo.year || '');
  const [vehicleColor, setVehicleColor] = useState(vehicleInfo.color || '');
  const [fuelType, setFuelType] = useState(vehicleInfo.fuelType || '');

  const [regNumErr, setRegNumErr] = useState('');
  const [vehicleBrandErr, setVehicleBrandErr] = useState('');
  const [vehicleModalErr, setVehicleModalErr]= useState('');
  const [manufactureYearErr, setManufactureYearErr] = useState('');
  const [vehicleColorErr, setVehicleColorErr] = useState('');
  const [fuelTypeErr, setFuelTypeErr] = useState('');
  const [permitNumberErr, setPermitNumberErr] = useState('');
  const [selectedErr, setSelectedErr] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState(() => {
    const formatted = getFormattedDate(vehicleInfo.insuranceExpiry);
    return formatted || new Date().toISOString().split('T')[0];
  });
  const [roadTaxExpiry, setRoadTaxExpiry] = useState(() => {
    const formatted = vehicleInfo.roadTaxExpiry === 'lifetime' ? 'lifetime' : getFormattedDate(vehicleInfo.roadTaxExpiry);
    return formatted || new Date().toISOString().split('T')[0];
  });
  const [roadTaxType, setRoadTaxType] = useState(vehicleInfo.roadTaxExpiry === 'lifetime' ? roadTaxExpiryLifetime[0] : roadTaxExpiryLifetime[1]);
  const [fuelTypeValue, setFuelTypeValue] = useState(fuelType || '');
  const [fitnessExpiry, setFitnessExpiry] = useState(() => {
    const formatted = getFormattedDate(vehicleInfo.fitnessExpiry);
    return formatted || new Date().toISOString().split('T')[0];
  });
  const [pucExpiry, setPucExpiry] = useState(() => {
    const formatted = getFormattedDate(vehicleInfo.pucExpiry);
    return formatted || new Date().toISOString().split('T')[0];
  });
  const [permitNumber, setPermitNumber] = useState(vehicleInfo.permitNumber || '');
  const [vehicleRcDoc, setVehicleRcDoc] = useState(vehicleInfo.vehicleRcDoc || '');

  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [currentModels, setCurrentModels] = useState([]);



  const getAvailableVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const api = new APIRequest();
      const url = `/publicrides/driver/getAvailabelVehicle`;
      const res = await api.request(url, 'GET', {}, userInfo?.token);
      if (res.success) {
        setVehicles(res.vehicleList);
      } else {
        showNotification(res?.message, '', 'danger');
      }
    } catch (error) {
      console.log('error-->>', error);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    getAvailableVehicles();
  }, []);

  // Memoize color mapping to avoid recreating on each render
  const colorMap = useMemo(() => ({
    '#FF0000': t('red'),
    '#00FF00': t('green'),
    '#0000FF': t('blue'),
    '#FFFF00': t('yellow'),
    '#FF00FF': t('magenta'),
    '#00FFFF': t('cyan'),
    '#000000': t('black'),
    '#FFFFFF': t('white'),
    '#808080': t('gray'),
    '#FFA500': t('orange'),
    '#800080': t('purple'),
    '#A52A2A': t('brown'),
    '#FFC0CB': t('pink'),
    '#808000': t('olive'),
    '#800000': t('maroon'),
    '#008080': t('teal'),
    '#000080': t('navy'),
  }), [t]);

  // Memoize year list to avoid recalculating
  const yearList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  }, []);

  const updateBrandListForVehicleType = useCallback(() => {
    let brandList = [];
    if (selected) {
      if (selected === "SUV") {
        brandList = indianSUVBrands;
      } else if (selected === "SEDAN") {
        brandList = indianSedanBrands;
      } else if (selected === "HATCHBACK") {
        brandList = indianHatchbackBrands;
      } else if (selected === "BIKE") {
        brandList = indianBikeBrands;
      } else if (selected === "AUTO") {
        brandList = indianAutoRickshawBrands;
      } else if (selected === "ELECTRIC_SEDAN") {
        brandList = indianElectricSedanBrands;
      } else if (selected === "ELECTRIC_HATCHBACK") {
        brandList = indianElectricHatchbackBrands;
      } else if (selected === "ELECTRIC_SUV") {
        brandList = indianElectricSUVBrands;
      } else if (selected === "ELECTRIC_AUTO") {
        brandList = indianElectricAutoRickshawBrands;
      } else {
        brandList = [...indianSUVBrands, ...indianSedanBrands, ...indianHatchbackBrands, ...indianElectricSedanBrands, ...indianElectricHatchbackBrands, ...indianElectricSUVBrands, ...indianElectricAutoRickshawBrands];
      }
      
      setFilteredBrands(brandList.map(brand => brand.name));
    }
  }, [selected]);

  useEffect(() => {
    // Initialize brands based on selected vehicle type
      updateBrandListForVehicleType();
  }, [selected, updateBrandListForVehicleType]);

  useEffect(() => {
    if (brandSearchQuery) {
      let brandList = [];
      
      if (selected && selected) {
        if (selected === "SUV") {
          brandList = indianSUVBrands;
        } else if (selected === "SEDAN") {
          brandList = indianSedanBrands;
        } else if (selected === "HATCHBACK") {
          brandList = indianHatchbackBrands;
        } else if (selected === "BIKE") {
          brandList = indianBikeBrands;
        } else if (selected === "AUTO") {
          brandList = indianAutoRickshawBrands;
        } else if (selected === "ELECTRIC_SEDAN") {
          brandList = indianElectricSedanBrands;
        } else if (selected === "ELECTRIC_HATCHBACK") {
          brandList = indianElectricHatchbackBrands;
        } else if (selected === "ELECTRIC_SUV") {
          brandList = indianElectricSUVBrands;
        } else if (selected === "ELECTRIC_AUTO") {
          brandList = indianElectricAutoRickshawBrands;
        
        } else {
          brandList = [...indianSUVBrands, ...indianSedanBrands, ...indianHatchbackBrands];
        }
      }
      
      const filtered = brandList
        .map(brand => brand.name)
        .filter(name => name.toLowerCase().includes(brandSearchQuery.toLowerCase()));
      setFilteredBrands(filtered);
    } else {
      updateBrandListForVehicleType();
    }
  }, [brandSearchQuery, selected, updateBrandListForVehicleType]);

  useEffect(() => {
    if (modelSearchQuery) {
      const filtered = currentModels.filter(model => 
        model.toLowerCase().includes(modelSearchQuery.toLowerCase())
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels(currentModels);
    }
  }, [modelSearchQuery, currentModels]);

  const validateManufactureYear = useCallback((year) => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return t('please_enter_a_valid_year');
    } else if (yearNum < 1900 || yearNum > currentYear) {
      return t(`year_must_be_between_1900_and_${currentYear}`);
    }
    return '';
  }, [t]);

  const onNextPress = async () => {
    let isValid = true;
    if (selected === null || selected.length === 0) {
      setSelectedErr('please select vehicle type');
      isValid = false;
    } else {
      setSelectedErr('');
    }

    if (!regNum) {
      setRegNumErr(t('please_enter_registration_number'));
      isValid = false;
    } else if (!vehicleNumberPattern.test(regNum)) {
      setRegNumErr(t('please_enter_a_valid_vehicle_registration_number'));
      isValid = false;
    } else {
      setRegNumErr('');
    }
    
    if (!vehicleBrand) {
      setVehicleBrandErr(t('please_enter_vehicle_brand'));
      isValid = false;
    } else {
      setVehicleBrandErr('');
    }
    
    if (!vehicleModal) {
      setVehicleModalErr(t('please_enter_vehicle_model'));
      isValid = false;
    } else {
      setVehicleModalErr('');
    }
    
    const yearError = !manufactureYear 
      ? t('please_enter_manufacturing_year') 
      : validateManufactureYear(manufactureYear);
    
    if (yearError) {
      setManufactureYearErr(yearError);
      isValid = false;
    } else {
      setManufactureYearErr('');
    }
    
    if (!vehicleColor) {
      setVehicleColorErr(t('please_enter_vehicle_color'));
      isValid = false;
    } else {
      setVehicleColorErr('');
    }
    
    if (!fuelType) {
      setFuelTypeErr(t('please_select_fuel_type'));
      isValid = false;
    } else {
      setFuelTypeErr('');
    }

    if (!permitNumber || permitNumber.length < 1) {
      // setPermitNumberErr('please enter permit number');
      setPermitNumberErr('');
      isValid = true;
    } else {
      setPermitNumberErr('');
    }
    
    if (isValid) {
      const payload = {
        regNo: regNum.trim(),
        color: vehicleColor,
        type: selected,
        make: vehicleBrand,
        model: vehicleModal,
        year: manufactureYear,
        fuelType: fuelType,
        permitNumber: permitNumber.trim(),
        insuranceExpiry: moment(insuranceExpiry).valueOf().toString(),
        roadTaxExpiry:roadTaxExpiry === 'lifetime' ? 'lifetime' : moment(roadTaxExpiry).valueOf().toString(),
        fitnessExpiry: moment(fitnessExpiry).valueOf().toString(), 
        pucExpiry: moment(pucExpiry).valueOf().toString(),
      }
      setIsLoading(true);
      try {
        const response = await publicrideDriverApi.updateVehicleDetails(payload,userInfo?.token);
        if(response.success){
          setVehicleInfo(payload);
          onNext(payload);
        } else {
          showNotification(response?.message, '', 'danger')
        }
      } catch (error) {
        console.error('Error updating vehicle details:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getColorName = useCallback((hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Find the closest color in our map
    let closestColor = t('custom');
    let minDistance = Number.MAX_VALUE;
    
    Object.entries(colorMap).forEach(([hex, name]) => {
      const r2 = parseInt(hex.slice(1, 3), 16);
      const g2 = parseInt(hex.slice(3, 5), 16);
      const b2 = parseInt(hex.slice(5, 7), 16);
      
      // Calculate color distance using Euclidean distance in RGB space
      const distance = Math.sqrt(
        Math.pow(r - r2, 2) + Math.pow(g - g2, 2) + Math.pow(b - b2, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = name;
      }
    });
    
    return closestColor;
  }, [colorMap]);

  // const onColorChange = useCallback((color) => {
  //   setSelectedColor(color);
  // }, []);

  const onColorSelected = useCallback((item) => {
    setVehicleColor(item);
    setVehicleInfo({ color: item });
    if (vehicleColorErr) setVehicleColorErr('');
    setColorPickerVisible(false);
  }, [selectedColor, vehicleColorErr]);

  const openColorPicker = useCallback(() => {
    setColorPickerVisible(true);
  }, []);

  const openYearPicker = useCallback(() => {
    setYearPickerVisible(true);
  }, []);

  const openBrandPicker = useCallback(() => {
    setBrandSearchQuery('');
    updateBrandListForVehicleType();
    setBrandPickerVisible(true);
  }, [updateBrandListForVehicleType]);
  
  const openModelPicker = useCallback(() => {
    if (!vehicleBrand) {
      Alert.alert(t('please_select_vehicle_brand_first'));
      return;
    }
    
    // Find models for the selected brand based on vehicle type
    let brandData = null;
    
    if (selected && selected) {
      if (selected === "SUV") {
        brandData = indianSUVBrands.find(brand => brand.name === vehicleBrand);
      } else if (selected === "SEDAN") {
        brandData = indianSedanBrands.find(brand => brand.name === vehicleBrand);
      } else if (selected === "HATCHBACK") {
        brandData = indianHatchbackBrands.find(brand => brand.name === vehicleBrand);
      } else if (selected === "BIKE") {
        brandData = indianBikeBrands.find(brand => brand.name === vehicleBrand);
      } else if (selected === "AUTO") {
        brandData = indianAutoRickshawBrands.find(brand => brand.name === vehicleBrand);
      } else if (selected === "ELECTRIC_SEDAN") {
        brandData = indianElectricSedanBrands.find(brand => brand.name === vehicleBrand);
      } else if (selected === "ELECTRIC_HATCHBACK") {
        brandData = indianElectricHatchbackBrands.find(brand => brand.name === vehicleBrand);
      } else if (selected === "ELECTRIC_SUV") {
        brandData = indianElectricSUVBrands.find(brand => brand.name === vehicleBrand);
      } else if (selected === "ELECTRIC_AUTO") {
        brandData = indianElectricAutoRickshawBrands.find(brand => brand.name === vehicleBrand);
      }
    }
    
    if (brandData && brandData.models) {
      setCurrentModels(brandData.models);
      setFilteredModels(brandData.models);
    } else {
      // If brand not found in our list, allow custom model entry
      setCurrentModels([]);
      setFilteredModels([]);
    }
    
    setModelSearchQuery('');
    setModelPickerVisible(true);
  }, [selected, vehicleBrand, t]);
  
  const selectedVehicle = useCallback((item) => {
    if(item.includes('ELECTRIC')){
      setFuelType('EV');  
      setVehicleInfo({ fuelType: 'EV' });
    } else {
      setFuelType(vehicleInfo.fuelType);
      setVehicleInfo({ fuelType: vehicleInfo.fuelType });
    }
    setSelected(item);
    setVehicleBrand('');
    setVehicleModal('');
  }, []);

  const selectBrand = useCallback((brand) => {
    setVehicleBrand(brand);
    if (vehicleBrandErr) setVehicleBrandErr('');
    setBrandPickerVisible(false);
    
    // Reset model when brand changes
    setVehicleModal('');
  }, [vehicleBrandErr]);

  const selectModel = useCallback((model) => {
    setVehicleModal(model);
    if (vehicleModalErr) setVehicleModalErr('');
    setModelPickerVisible(false);
  }, [vehicleModalErr]);

  const selectYear = useCallback((year) => {
    setManufactureYear(year.toString());
    setVehicleInfo({ year: year.toString() });
    if (manufactureYearErr) setManufactureYearErr('');
    setYearPickerVisible(false);
  }, [manufactureYearErr]);

  // DateTime picker handlers
  const openInsuranceExpiryPicker = useCallback(() => {
    setInsuranceExpiryPickerVisible(true);
  }, []);

  const openRoadTaxExpiryPicker = useCallback(() => {
    setRoadTaxExpiryPickerVisible(true);
  }, []);

  const openFitnessExpiryPicker = useCallback(() => {
    setFitnessExpiryPickerVisible(true);
  }, []);

  const openPucExpiryPicker = useCallback(() => {
    setPucExpiryPickerVisible(true);
  }, []);

  const openFuelTypePicker = useCallback(() => {
    setFuelTypePickerVisible(true);
  }, []);

  const handleInsuranceExpiryChange = useCallback((event, selectedDate) => {
    setInsuranceExpiryPickerVisible(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      setInsuranceExpiry(formattedDate);
    }
  }, []);

  const handleRoadTaxExpiryChange = useCallback((event, selectedDate) => {
    setRoadTaxExpiryPickerVisible(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      setRoadTaxExpiry(formattedDate);
    }
  }, []);

  const handleFitnessExpiryChange = useCallback((event, selectedDate) => {
    setFitnessExpiryPickerVisible(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      setFitnessExpiry(formattedDate);
    }
  }, []);

  const handlePucExpiryChange = useCallback((event, selectedDate) => {
    setPucExpiryPickerVisible(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      setPucExpiry(formattedDate);
    }
  }, []);

  const handleFuelTypeChange = useCallback((item) => {
    setFuelType(item.value);
    if (fuelTypeErr) setFuelTypeErr('');
    setFuelTypePickerVisible(false);
  }, [fuelTypeErr]);

  const fuelTypes = [
    { label: t('petrol'), value: 'PETROL' },
    { label: t('diesel'), value: 'DIESEL' },
    { label: t('cng'), value: 'CNG' },
    { label: t('ev'), value: 'EV' },
    { label: t('lpg'), value: 'LPG' },
    { label: t('petrol_plus_cng'), value: 'PETROL + CNG' },
    { label: t('hydrogen'), value: 'HYDROGEN' },
  ];

  const getImage = (key) => {
    return vehicleList?.find(item => item.name === key)?.image
  }

  // Update the DateTimePicker components to handle invalid dates safely
  const getSafeDate = useCallback((dateString) => {
    if (!dateString) return new Date();
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date();
      }
      return date;
    } catch (error) {
      console.warn('Invalid date string:', dateString);
      return new Date();
    }
  }, []);

  const filteredfuelTypes = () => {
    if (!selected) {
      return fuelTypes;
    }
    if (selected.includes('ELECTRIC')) {
      return fuelTypes.filter(f => f.value === 'EV');
    }
    return fuelTypes.filter(f => f.value !== 'EV');
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.periwinkle} />
        </View>
      ) : vehicles?.vehicleTypes ? (
      <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <>
          <Text style={[styles.vehicleName, styles.marginBottom10]}>{t('vehicle_type')}</Text>
          <View style={styles.vehileList}>
            
            {Object.entries(vehicles?.vehicleTypes).map(([key, value]) => (
               <TouchableOpacity 
               onPress={() => {
                selectedVehicle(key)
                setSelectedErr('');
                setVehicleInfo({ type: key });
               }} 
               key={key} 
               style={[
                 styles.vehileListCard,
                 {
                   borderColor: selected === key ? Colors.periwinkle : Colors.grey,
                   backgroundColor: selected === key ? Colors.white : Colors.grey_light
                 }
               ]}
                >
               <View style={styles.vehicleIconContainer}>
                <View style={styles.vehicleImageContainer}>
                {getImage(key)}
                {key.includes('ELECTRIC') && <MaterialIcons name="electric-bolt" size={14} color={Colors.green} />}
                </View>
                 <Text style={styles.vehicleName}>{(key).replace('_', ' ')}</Text>
               </View>
             </TouchableOpacity>
            ))}
            {selectedErr && <Text style={[styles.vehicleName,{ fontSize: 12,
    color: Colors.danger_red,
    fontFamily: Fonts.light,
    bottom: 8}]}>{selectedErr}</Text>}
          </View>
          </>
          <InputField
            style={styles.textField}
            value={regNum}
            label={t('vehicle_registration_number')}
            errorText={regNumErr}
            autoCapitalize='characters'
            onChangeText={text => {
              setRegNum(text);
              setVehicleInfo({ regNo: text });
              if (regNumErr && text.length > 0) setRegNumErr('');
            }}
            isRequired={true}
          />
          <TouchableOpacity onPress={openBrandPicker}>
            <InputField
              style={styles.textField}
              value={vehicleBrand}
              label={t('vehicle_brand')}
              errorText={vehicleBrandErr}
              editable={false}
              isRequired={true}
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={openModelPicker}>
            <InputField
              style={driverDetailStyles.textField}
              value={vehicleModal}
              label={t('vehicle_model')}
              errorText={vehicleModalErr}
              editable={false}
              isRequired={true}
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={openYearPicker}>
            <InputField
              style={styles.textField}
              value={manufactureYear}
              label={t('manufacturing_year')}
              errorText={manufactureYearErr}
              editable={false}
              isRequired={true}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openColorPicker}>
            <InputField
              style={styles.textField}
              value={vehicleColor}
              label={t('vehicle_color')}
              errorText={vehicleColorErr}
              editable={false}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openFuelTypePicker}>
            <InputField
              style={styles.textField}
              value={fuelTypes.find(f => f.value === fuelType)?.label || ''}
              label={t('fuel_type')}
              errorText={fuelTypeErr}
              editable={false}
              isRequired={true}
              />
          </TouchableOpacity>
          <InputField
            style={styles.textField}
            value={permitNumber}
            label={t('permit_number')}
            errorText={permitNumberErr}
            onChangeText={text => {
              setPermitNumber(text);
              setVehicleInfo({ permitNumber: text });
              if (permitNumberErr && text.length > 0) setPermitNumberErr('');
            }}
            isRequired={false}
            />
        <TouchableOpacity onPress={openInsuranceExpiryPicker}>
        <InputField
            style={styles.textField}
            value={insuranceExpiry}
            label={t('insurance_expiry')}
            editable={false}
            isRequired={true}
          />
        </TouchableOpacity>
        <Text style={styles.radioButtonTxt}>{t('road_tax')}</Text>
        <View style={styles.radioButtonContainer}>
        {roadTaxExpiryLifetime.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.radioButtonWrapper,{backgroundColor: roadTaxType?.id === item.id ? Colors.periwinkle_light : Colors.white}]}
              onPress={() => {
                if(item.value === 'lifetime'){
                  setRoadTaxExpiry('lifetime');
                } else {
                  openRoadTaxExpiryPicker();
                }
                 setRoadTaxType(item)
              }}
            >
              <View style={styles.radioButton}>
                 <Text style={styles.radioButtonTxt}>{t(item.value)}</Text>
              </View>
            </TouchableOpacity> 
         ))}
            </View>
          <TouchableOpacity disabled={roadTaxType?.value === 'lifetime'} onPress={openRoadTaxExpiryPicker}>
          <InputField
            style={styles.textField}
            value={roadTaxExpiry}
            label={t('road_tax_expiry')}
            editable={false}
            isRequired={true}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={openFitnessExpiryPicker}>
          
          <InputField
            style={styles.textField}
            value={fitnessExpiry}
            label={t('fitness_expiry')}
            editable={false}
            isRequired={true}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={openPucExpiryPicker}>
          <InputField
            style={styles.textField}
            value={pucExpiry}
            label={t('puc_expiry')}
            editable={false}
            isRequired={true}
            />
        </TouchableOpacity>          
        </View>
      </ScrollView>
      
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={driverDetailStyles.nextBtn}
          onPress={onNextPress}
          disabled={isLoading}
        >
          <Text style={driverDetailStyles.nextTxt}>{t('next')}</Text>
          {isLoading ? <ActivityIndicator size="small" color={Colors.white} /> : <AntDesign name="arrowright" color={Colors.white} size={16} />}
        </TouchableOpacity>
      </View>
        </>
      ) : null}
      {/* Color Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={colorPickerVisible}
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_vehicle_color')}</Text>
              <TouchableOpacity onPress={() => setColorPickerVisible(false)}>
                <AntDesign name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            
             <ScrollView style={styles.yearPickerContainer}>
             {carColorList.map((color) => (
                <TouchableOpacity
                  key={color.name}
                  style={[
                    styles.colorItem,
                    vehicleColor === color?.name?.toString() && styles.selectedYearItem
                  ]}
                  onPress={() => onColorSelected(color.name)}
                >
                  <Text 
                    style={[
                      styles.yearText,
                      vehicleColor === color?.name?.toString() && styles.selectedYearText,{minWidth: '30%'}
                    ]}
                  >
                    {color.name} 
                  </Text>
                  <View style={[styles.colorSample, {backgroundColor: color.hex}]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* <TouchableOpacity
              style={styles.selectColorBtn}
              onPress={onColorSelected}>
              <Text style={styles.selectColorBtnText}>{t.select_color}</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={yearPickerVisible}
        onRequestClose={() => setYearPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_manufacturing_year')}</Text>
              <TouchableOpacity onPress={() => setYearPickerVisible(false)}>
                <AntDesign name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.yearPickerContainer}>
              {yearList.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearItem,
                    manufactureYear === year.toString() && styles.selectedYearItem
                  ]}
                  onPress={() => selectYear(year)}
                >
                  <Text 
                    style={[
                      styles.yearText,
                      manufactureYear === year.toString() && styles.selectedYearText
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Brand Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={brandPickerVisible}
        onRequestClose={() => setBrandPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_vehicle_brand')}</Text>
              <TouchableOpacity onPress={() => setBrandPickerVisible(false)}>
                <AntDesign name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={t('type_vehicle_brand')}
                value={brandSearchQuery}
                onChangeText={setBrandSearchQuery}
              />
              {brandSearchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearSearch}
                  onPress={() => setBrandSearchQuery('')}
                >
                  <AntDesign name="close" size={16} color={Colors.grey} />
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView style={styles.yearPickerContainer}>
              {filteredBrands.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.yearItem,
                    vehicleBrand === brand && styles.selectedYearItem
                  ]}
                  onPress={() => { selectBrand(brand); setVehicleInfo({ make:brand }); }}
                >
                  <Text 
                    style={[
                      styles.yearText,
                      vehicleBrand === brand && styles.selectedYearText
                    ]}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredBrands.length === 0 && brandSearchQuery.length > 0 && (
                <TouchableOpacity
                  style={[styles.yearItem, {marginTop: 10}]}
                  onPress={() => {
                    selectBrand(brandSearchQuery);
                    setVehicleInfo({ make:brandSearchQuery });
                  }}
                >
                  <Text style={[styles.yearText, {color: Colors.violet}]}>
                    {`${t('add')} ${brandSearchQuery} ${t('as_vehicle_brand')}`}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Model Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modelPickerVisible}
        onRequestClose={() => setModelPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_vehicle_model')}</Text>
              <TouchableOpacity onPress={() => setModelPickerVisible(false)}>
                <AntDesign name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={t('type_vehicle_model')}
                value={modelSearchQuery}
                onChangeText={setModelSearchQuery}
              />
              {modelSearchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearSearch}
                  onPress={() => setModelSearchQuery('')}
                >
                  <AntDesign name="close" size={16} color={Colors.grey} />
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView style={styles.yearPickerContainer}>
              {filteredModels.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.yearItem,
                    vehicleModal === model && styles.selectedYearItem
                  ]}
                  onPress={() => {selectModel(model),setVehicleInfo({ model:model });}}
                >
                  <Text 
                    style={[
                      styles.yearText,
                      vehicleModal === model && styles.selectedYearText
                    ]}
                  >
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredModels.length === 0 && modelSearchQuery.length > 0 && (
                <TouchableOpacity
                  style={[styles.yearItem, {marginTop: 10}]}
                  onPress={() => {
                    selectModel(modelSearchQuery);
                    setVehicleInfo({ model:modelSearchQuery })
                  }}
                >
                  <Text style={[styles.yearText, {color: Colors.violet}]}>
                    {`${t('add')} ${modelSearchQuery} ${t('as_vehicle_model')}`}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fuel Type Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fuelTypePickerVisible}
        onRequestClose={() => setFuelTypePickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_fuel_type')}</Text>
              <TouchableOpacity onPress={() => setFuelTypePickerVisible(false)}>
                <AntDesign name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            
             <ScrollView style={styles.yearPickerContainer}>
               {filteredfuelTypes().map(item => (
                 <TouchableOpacity
                   key={item.value}
                   style={[
                     styles.yearItem,
                     fuelType === item.value && styles.selectedYearItem
                   ]}
                   onPress={() => {
                    if(selected?.includes('ELECTRIC') && item.value !== 'EV'){
                      Alert.alert('Electric vehicles cannot be changed to other fuel types', '', [{text: 'OK', style: 'default'}]);
                      return;
                    }
                     setFuelType(item.value);
                     setFuelTypePickerVisible(false);
                     setVehicleInfo({ fuelType: item.value });
                   }}
                 >
                   <Text 
                     style={[
                       styles.yearText,
                       fuelType === item.value && styles.selectedYearText
                     ]}
                   >
                     {item.label}
                   </Text>
                 </TouchableOpacity>
               ))}
             </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DateTime Pickers */}
      {insuranceExpiryPickerVisible && (
        <DateTimePicker
          testID="insuranceExpiryPicker"
          value={getSafeDate(insuranceExpiry)}
          mode="date"
          display="default"
          onChange={handleInsuranceExpiryChange}
        />
      )}

      {roadTaxExpiryPickerVisible && (
        <DateTimePicker
          testID="roadTaxExpiryPicker"
          value={getSafeDate(roadTaxExpiry)}
          mode="date"
          display="default"
          onChange={handleRoadTaxExpiryChange}
        />
      )}

      {fitnessExpiryPickerVisible && (
        <DateTimePicker
          testID="fitnessExpiryPicker"
          value={getSafeDate(fitnessExpiry)}
          mode="date"
          display="default"
          onChange={handleFitnessExpiryChange}
        />
      )}

      {pucExpiryPickerVisible && (
        <DateTimePicker
          testID="pucExpiryPicker"
          value={getSafeDate(pucExpiry)}
          mode="date"
          display="default"
          onChange={handlePucExpiryChange}
        />
      )}
    </View>
  );
};

export default VehicleEntry;
