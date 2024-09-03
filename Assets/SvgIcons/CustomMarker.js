import React from 'react';
import Svg, { G, Path, Circle, Text } from 'react-native-svg';

const CustomMarker = ({ index, fillColor, backgroundColor }) => (
    <Svg width="16.41" height="20" viewBox="0 0 16.41 20">
        <G data-name="Group 28486" transform="translate(-409.117 -248.373)">
            <Path
                data-name="Path 43686"
                d="M425.527 256.578c0 6.355-7.6 11.493-7.921 11.709a.512.512 0 01-.569 0c-.324-.216-7.921-5.354-7.921-11.709a8.205 8.205 0 0116.41 0z"
                fill={fillColor}
            />
            <Circle
                data-name="Ellipse 2750"
                cx="6.537"
                cy="6.537"
                r="6.537"
                transform="translate(410.785 250.041)"
                fill={backgroundColor}
            />
            <Text
                x="8.205" // Half of the viewBox width
                y="12" // Just a bit more than the radius of the circle plus the circle's Y offset
                textAnchor="middle"
                fill={fillColor}
                fontSize="6" // Adjust this as needed
                dy=".3em" // Adjust this as needed
            >
                {index}
            </Text>
        </G>
    </Svg>
);

export default CustomMarker;
