# Debounce Hooks

This directory contains custom hooks for implementing debounce functionality to optimize API calls and user interactions.

## Available Hooks

### `useDebounce`
General-purpose debounce hook for any function.

```javascript
import { useDebounce } from '../hooks/useDebounce';

const debouncedFunction = useDebounce((value) => {
  // Your function logic here
  console.log('Debounced:', value);
}, 500);
```

### `useDebouncedAPICall`
Specifically designed for API calls with a default 500ms delay.

```javascript
import { useDebouncedAPICall } from '../hooks/useDebounce';

const debouncedAPICall = useDebouncedAPICall(async (data) => {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}, 300);
```

### `useDebouncedSearch`
Optimized for search functionality with a default 300ms delay.

```javascript
import { useDebouncedSearch } from '../hooks/useDebounce';

const debouncedSearch = useDebouncedSearch((searchTerm) => {
  performSearch(searchTerm);
}, 300);

// Usage in TextInput
<TextInput onChangeText={debouncedSearch} />
```

### `useDebouncedMapInteraction`
Designed for map interactions like center changes with a default 200ms delay.

```javascript
import { useDebouncedMapInteraction } from '../hooks/useDebounce';

const debouncedMapCenterChange = useDebouncedMapInteraction((coordinates) => {
  reverseGeocode(coordinates);
}, 200);
```

## Implementation Examples

### Search Screen
```javascript
const SearchScreen = () => {
  const searchAPI = useCallback(async (value) => {
    const searchResults = await performSearch(searchParams);
    setOnSearchResults(searchResults);
  }, [location, setOnSearchResults]);

  const debouncedSearch = useDebouncedSearch(searchAPI, 500);

  const handleTextChange = useCallback((value) => {
    debouncedSearch(value);
    setSearchTxt(value);
  }, [debouncedSearch]);
};
```

### Pick Location Screen
```javascript
const PickLocationScreen = () => {
  const fetchAddressName = useCallback(async (lat, lng) => {
    const search = new SearchAPI();
    const response = await search.reverseGeocode([lat, lng]);
    return response.properties.street || response.properties.name;
  }, []);

  const debouncedMapCenterChange = useDebouncedMapInteraction(async (data) => {
    setIsAddressLoading(true);
    const address = await fetchAddressName(data.longitude, data.latitude);
    setPickedLocation({
      latitude: data.latitude,
      longitude: data.longitude,
      address: address,
    });
    setIsAddressLoading(false);
  }, 300);

  const onMapCenterChanged = (data) => {
    debouncedMapCenterChange(data);
  };
};
```

### Plan Ride Screen
```javascript
const PlanRideScreen = () => {
  const debouncedSearchCallback = useDebouncedAPICall((item, type) => {
    HandsetRideLocation(item, type);
    goBack();
  }, 300);

  const debouncedPickLocationCallback = useDebouncedAPICall((item, type) => {
    HandsetRideLocation(item, type);
    goBack();
  }, 300);

  const debouncedHistoryCallback = useDebouncedAPICall((item) => {
    HandsetRideLocation(item, LocationTypes.DESTINATION_LOCATION);
  }, 300);
};
```

## Benefits

1. **Reduced API Calls**: Prevents excessive API calls during rapid user input
2. **Better Performance**: Improves app responsiveness and reduces server load
3. **Cost Optimization**: Reduces API usage costs
4. **Better UX**: Prevents UI flickering from rapid state updates

## Best Practices

1. **Choose Appropriate Delays**:
   - Search: 300-500ms
   - Map interactions: 200-300ms
   - General API calls: 500ms

2. **Use useCallback** for the functions passed to debounce hooks to prevent unnecessary re-renders

3. **Handle Loading States**: Show loading indicators while debounced functions are pending

4. **Error Handling**: Always wrap debounced API calls in try-catch blocks

5. **Cleanup**: Consider canceling pending debounced calls when components unmount 