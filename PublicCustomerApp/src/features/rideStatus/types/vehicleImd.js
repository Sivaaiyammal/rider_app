import React from 'react';
import { Image } from 'react-native';
import AutoIcon from '../../../assets/vehicle/AUTO.webp';
import BikeIcon from '../../../assets/vehicle/BIKE.webp';
import SuvIcon from '../../../assets/vehicle/SUV.webp';
import SedanIcon from '../../../assets/vehicle/SEDAN.webp';
import HatchbackIcon from '../../../assets/vehicle/HATCHBACK.webp';
import ExSedanIcon from '../../../assets/vehicle/ExSEDAN.webp';

export const getVehicleImage = (type,style) => {
    console.log('type', type)
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
        default:
            return <Image source={AutoIcon} style={style} />
    }
}