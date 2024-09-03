import { View, Image, TouchableOpacity } from "react-native";

import { HomeControl, DriverStatusStyle } from '../../Styles/DriverStyle/DriverHomeStyle'
import { GoOnlineStyle, GoOfflineStyle, GoBreakStyle, statusControl, homeStatusStyle, styles } from "../../Styles/DriverStyle/StatusPopupStyle"

// images

import DriverActive from "../../Assets/HomeScreen/DriverActive.webp"
import DriverIdle from "../../Assets/HomeScreen/DriverIdle.webp"
import DriverBreak from "../../Assets/HomeScreen/DriverBreak.webp"
import GoOnline from "./GoOnline";
import { useState } from "react";
import GoOffline from "./GoOffline";
import GoBreak from "./GoBreak";

import { flexStyle } from '../../Styles/Common/Common'


const status = ["online", "offline"]

export default function DriverSTatus(props) {
    let { currentStatus, onStatusChanged } = props
    const [activeMenu, setActiveMenu] = useState(null)

    return (
        <>
            {
                status.map((s, i) => {
                    if (s == currentStatus) return null
                    let icon = s == "online" ? DriverActive : s == "offline" ? DriverIdle : DriverBreak
                    let iconBackground = s == "online" ? "#299865" : s == "offline" ? "tomato" : "#7268ff"

                    return (
                        <View key={i} style={flexStyle.acjc}>
                            {
                                s == "offline" && activeMenu == "offline" && <GoOffline
                                    onCancel={() => onStatusChanged(currentStatus)}
                                    onSuccess={() => onStatusChanged("offline")}
                                />
                            }
                            {
                                s == "online" && activeMenu == "online" && <GoOnline
                                    onCancel={() => onStatusChanged(currentStatus)}
                                    onSuccess={() => onStatusChanged("online")}
                                />
                            }
                            {
                                s == "break" && activeMenu == "break" && <GoBreak
                                    onCancel={() => onStatusChanged(currentStatus)}
                                    onSuccess={(breakTime) => onStatusChanged("break",breakTime)}
                                />
                            }
                            <TouchableOpacity
                                style={[homeStatusStyle.button, { backgroundColor: iconBackground }]}
                                onPress={() => {
                                    setActiveMenu(activeMenu == s ? null : s)
                                }}>

                                <View style={homeStatusStyle.iconContainer}>
                                    <Image source={icon} style={homeStatusStyle.icon} />
                                </View>
                            </TouchableOpacity>
                        </View>

                    )
                })
            }


        </>
    )
}