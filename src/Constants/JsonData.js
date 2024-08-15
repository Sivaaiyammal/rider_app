import Profile from "../Assets/Icons/settings/editProfile.svg";
import Account from "../Assets/Icons/settings/account.svg";
import Lock from "../Assets/Icons/settings/lock.svg";
import Location from "../Assets/Icons/settings/location.svg";
import Routes from "../Assets/Icons/settings/routes.svg";
import Language from "../Assets/Icons/settings/language.svg";
import Theme from "../Assets/Icons/settings/theme.svg";
import Notification from "../Assets/Icons/settings/notification.svg";
import Shield from "../Assets/Icons/settings/shield.svg";
import Help from "../Assets/Icons/settings/help.svg";
import Terms from "../Assets/Icons/settings/accept.svg";
import Privacy from "../Assets/Icons/settings/privacy_policy.svg";
import About from "../Assets/Icons/settings/info.svg";
import FeedBack from "../Assets/Icons/settings/feedback.svg";
import Report from "../Assets/Icons/settings/error.svg";
import Support from "../Assets/Icons/settings/support.svg";
import More from "../Assets/Icons/settings/dashboard.svg";
import Refresh from "../Assets/Icons/settings/refresh.svg";

export const searchTabBtns = [
  {
    id: 1,
    name: "Map",
    title: "map",
  },
  {
    id: 2,
    name: "Recent",
    title: "recent",
  },
  {
    id: 3,
    name: "Saved",
    title: "saved",
  },
  {
    id: 4,
    name: "POI",
    title: "poi",
  },
];

export const radioBtns = [
  {
    id: 1,
    name: "home",
    value: "Home",
  },
  { id: 2, name: "work", value: "Work" },
  { id: 3, name: "other", value: "Other" },
];

export const poiSearchData = [
  {
    title: "food",
    data: [
      { poiID: 0, name: "restaurant", icon: "wine-bottle" }, // case 0
      { poiID: 7, name: "cafe", icon: "coffee" }, // case 7
      { poiID: 2, name: "fast_food", icon: "hamburger" }, // case 2
    ],
  },
  {
    title: "health",
    data: [
      { poiID: 34, name: "hospital", icon: "hospital" }, // case 34
      { poiID: 33, name: "pharmacy", icon: "hospital-user" }, // case 33
    ],
  },
  {
    title: "shopping",
    data: [
      { poiID: 301, name: "supermarket", icon: "store" }, // case 301
      { poiID: 252, name: "department_store", icon: "store" }, // case 252
      { poiID: 267, name: "general", icon: "store" }, // case 267
      { poiID: 240, name: "carrepair", icon: "car" }, // case 240
      { poiID: 239, name: "cars", icon: "car" }, // case 239
      { poiID: 282, name: "mall", icon: "store" }, // case 282
    ],
  },
  {
    title: "leisure",
    data: [
      { poiID: 174, name: "park", icon: "dharmachakra" }, // case 174
      { poiID: 179, name: "stadium", icon: "dharmachakra" }, // case 179
      { poiID: 171, name: "marina", icon: "swimming-pool" }, // case 171
      { poiID: 178, name: "sports_center", icon: "futbol" }, // case 178
      { poiID: 169, name: "golf_course", icon: "life-ring" }, // case 169
      { poiID: 175, name: "pitch", icon: "house-user" }, // case 175
    ],
  },
  {
    title: "cash",
    data: [
      { poiID: 29, name: "atm", icon: "cash-register" }, // case 29
      { poiID: 30, name: "bank", icon: "money-bill" }, // case 30
    ],
  },
  {
    title: "airport",
    data: [
      { poiID: 75, name: "terminal", icon: "plane" }, // case 75
      { poiID: 71, name: "aerodrome", icon: "plane" }, // case 71
      { poiID: 171, name: "marina", icon: "plane" }, // case 171
    ],
  },
  {
    title: "sleeping",
    data: [{ poiID: 1003, name: "hotel", icon: "hotel" }], // case 1003
  },
  {
    title: "public",
    data: [
      { poiID: 214, name: "government", icon: "building" }, // case 214
      { poiID: 53, name: "embassy", icon: "archway" }, // case 53
      { poiID: 54, name: "fire_station", icon: "fire" }, // case 54
      { poiID: 67, name: "toilets", icon: "toilet" }, // case 67
    ],
  },
  {
    title: "education",
    data: [
      { poiID: 12, name: "school", icon: "school" }, // case 12
      { poiID: 1001, name: "college", icon: "school" }, // case 1001
      { poiID: 1002, name: "university", icon: "school" }, // case 1002
      { poiID: 14, name: "library", icon: "book" }, // case 14
    ],
  },
  {
    title: "religious",
    data: [
      { poiID: 58, name: "mosque", icon: "mosque" }, // case 58
      { poiID: 58, name: "church", icon: "church" }, // case 58
    ],
  },
  {
    title: "transports",
    data: [
      { poiID: 142, name: "bus_stops", icon: "bus" }, // case 142
      { poiID: 27, name: "fuel_station", icon: "station" }, // case 27
      { poiID: 28, name: "charge_station", icon: "charging-station" }, // case 28
    ],
  },
  {
    title: "tourism",
    data: [
      { poiID: 369, name: "attractions", icon: "ticket-alt" }, // case 369
      { poiID: 380, name: "museums", icon: "monument" }, // case 380
      { poiID: 378, name: "information", icon: "info-circle" }, // case 378
      { poiID: 376, name: "hostels", icon: "hotel" }, // case 376
    ],
  },
];

export const routeOptionsData = [
  {
    id: 1,
    name: "Avoid Motorways",
  },
  {
    id: 2,
    name: "Avoid Toll Roads",
  },
  {
    id: 3,
    name: "Avoid Ferries",
  },
  {
    id: 4,
    name: "Avoid Highways",
  },
];

export const settingsDataA = [
  {
    id: 1,
    name: "Edit Profile",
    icon: <Profile />,
    screenName: "RouteSettings",
  },
  {
    id: 2,
    name: "Synced Accounts",
    icon: <Account />,
    screenName: "RouteSettings",
  },
  {
    id: 3,
    name: "Change Password",
    icon: <Lock />,
    screenName: "RouteSettings",
  },
];

export const settingsDataB = [
  {
    id: 1,
    name: "My Location",
    icon: <Location />,
    screenName: "RouteSettings",
  },
  {
    id: 2,
    name: "Route Settings",
    icon: <Routes />,
    screenName: "RouteSettings",
  },
  {
    id: 3,
    name: "Languages",
    icon: <Language />,
    screenName: "RouteSettings",
  },
  {
    id: 4,
    name: "Color Theme",
    icon: <Theme />,
    screenName: "RouteSettings",
  },
  {
    id: 5,
    name: "Notification",
    icon: <Notification />,
    screenName: "RouteSettings",
  },
];

export const settingsDataC = [
  {
    id: 1,
    name: "Data Privacy",
    icon: <Shield />,
    screenName: "RouteSettings",
  },
  {
    id: 2,
    name: "Help",
    icon: <Help />,
    screenName: "RouteSettings",
  },
  {
    id: 3,
    name: "Terms and Conditions",
    icon: <Terms />,
    screenName: "RouteSettings",
  },
  {
    id: 4,
    name: "Privacy Policy",
    icon: <Privacy />,
    screenName: "RouteSettings",
  },
];

export const settingsDataD = [
  {
    id: 1,
    name: "About Us",
    icon: <About />,
    screenName: "RouteSettings",
  },
  {
    id: 2,
    name: "Send FeedBack",
    icon: <FeedBack />,
    screenName: "RouteSettings",
  },
  {
    id: 3,
    name: "Report Error",
    icon: <Report />,
    screenName: "RouteSettings",
  },
  {
    id: 4,
    name: "Support",
    icon: <Support />,
    screenName: "RouteSettings",
  },
];

export const settingsDataE = [
  {
    id: 1,
    name: "More Apps",
    icon: <More />,
    screenName: "RouteSettings",
  },
  {
    id: 2,
    name: "Check for Updates",
    icon: <Refresh />,
    screenName: "RouteSettings",
  },
];
