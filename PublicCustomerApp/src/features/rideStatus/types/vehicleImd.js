import React from 'react';
import { Image } from 'react-native';
import AutoIcon from '../../../assets/vehicle/AUTO.webp';
import BikeIcon from '../../../assets/vehicle/BIKE.webp';
import SuvIcon from '../../../assets/vehicle/SUV.webp';
import SedanIcon from '../../../assets/vehicle/SEDAN.webp';
import HatchbackIcon from '../../../assets/vehicle/HATCHBACK.webp';
import ExSedanIcon from '../../../assets/vehicle/ExSEDAN.webp';
import ElectricAutoIcon from '../../../assets/vehicle/AUTO.webp';
import ElectricBikeIcon from '../../../assets/vehicle/BIKE.webp';
import ElectricHatchbackIcon from '../../../assets/vehicle/HATCHBACK.webp';
import ElectricSedanIcon from '../../../assets/vehicle/SEDAN.webp';
import ElectricSuvIcon from '../../../assets/vehicle/SUV.webp';

export const getVehicleImage = (type,style) => {
  
    switch(type){
        case 'AUTO':
            return <Image source={AutoIcon} style={style} />
        case 'BIKE':
            return <Image source={BikeIcon} style={style} />
        case 'SUV':
            return <Image source={SuvIcon} style={style} />
        case 'SEDAN':
            return <Image source={SedanIcon} style={style} />
        case 'HATCHBACK':
            return <Image source={HatchbackIcon} style={style} />
        case 'EX_SEDAN':
            return <Image source={ExSedanIcon} style={style} />
        case 'ELECTRIC_AUTO':
            return <Image source={ElectricAutoIcon} style={style} />
        case 'ELECTRIC_BIKE':
            return <Image source={ElectricBikeIcon} style={style} />
        case 'ELECTRIC_HATCHBACK':
            return <Image source={ElectricHatchbackIcon} style={style} />
        case 'ELECTRIC_SEDAN':
            return <Image source={ElectricSedanIcon} style={style} />
        case 'ELECTRIC_SUV':
            return <Image source={ElectricSuvIcon} style={style} />
        default:
            return <Image source={AutoIcon} style={style} />
    }
}