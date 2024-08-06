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
    value:"Home"
  },
  { id: 2, name: "work", value:"Work" },
  { id: 3, name: "other", value: "Other" },
];

export const poiSearchData = [
  {
    title: "food",
    data: [
      { poiID: 0, name: "restaurant" }, // case 0 // no data or error message returns for poiID:0 
      { poiID: 7, name: "cafe" }, // case 7
      { poiID: 2, name: "fast_food" }, // case 2
    ],
  },
  {
    title: "health",
    data: [
      { poiID: 34, name: "hospital" }, // case 34
      { poiID: 33, name: "pharmacy" }, // case 33
    ],
  },
  {
    title: "shopping",
    data: [
      { poiID: 301, name: "supermarket" }, // case 301
      { poiID: 252, name: "department_store" }, // case 252
      { poiID: 267, name: "general" }, // case 267
      { poiID: 240, name: "carrepair" }, // case 240
      { poiID: 239, name: "cars" }, // case 239
      { poiID: 282, name: "mall" }, // case 282
    ],
  },
  {
    title: "leisure",
    data: [
      { poiID: 174, name: "park" }, // case 174
      { poiID: 179, name: "stadium" }, // case 179
      { poiID: 171, name: "marina" }, // case 171
      { poiID: 178, name: "sports_center" }, // case 178
      { poiID: 169, name: "golf_course" }, // case 169
      { poiID: 175, name: "pitch" }, // case 175
    ],
  },
  {
    title: "cash",
    data: [
      { poiID: 29, name: "atm" }, // case 29
      { poiID: 30, name: "bank" }, // case 30
    ],
  },
  {
    title: "airport",
    data: [
      { poiID: 75, name: "terminal" }, // case 75
      { poiID: 71, name: "aerodrome" }, // case 71
      { poiID: 171, name: "marina" }, // case 171
    ],
  },
  {
    title: "sleeping",
    data: [{ poiID: 1003, name: "hotel" }], // case 1003
  },
  {
    title: "public",
    data: [
      { poiID: 214, name: "government" }, // case 214
      { poiID: 53, name: "embassy" }, // case 53
      { poiID: 54, name: "fire_station" }, // case 54
      { poiID: 67, name: "toilets" }, // case 67
    ],
  },
  {
    title: "education",
    data: [
      { poiID: 12, name: "school" }, // case 12
      { poiID: 1001, name: "college" }, // case 1001
      { poiID: 1002, name: "university" }, // case 1002
      { poiID: 14, name: "library" }, // case 14
    ],
  },
  {
    title: "religious",
    data: [
      { poiID: 58, name: "mosque" }, // case 58
      { poiID: 58, name: "church" }, // case 58
    ],
  },
  {
    title: "transports",
    data: [
      { poiID: 142, name: "bus_stops" }, // case 142
      { poiID: 27, name: "fuel_station" }, // case 27
      { poiID: 28, name: "charge_station" }, // case 28
    ],
  },
  {
    title: "tourism",
    data: [
      { poiID: 369, name: "attractions" }, // case 369
      { poiID: 380, name: "museums" }, // case 380
      { poiID: 378, name: "information" }, // case 378
      { poiID: 376, name: "hostels" }, // case 376
    ],
  },
];

