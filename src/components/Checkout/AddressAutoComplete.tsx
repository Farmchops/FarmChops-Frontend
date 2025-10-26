// // src/components/Checkout/AddressAutocomplete.tsx
// import React, { useRef, useEffect, useState } from 'react';
// import { MapPin } from 'lucide-react';
// import { useGooglePlaces, type PlaceResult } from '@/hooks/useGooglePlaces';

// export interface AddressDetails {
//     fullAddress: string;
//     street?: string;
//     city?: string;
//     state?: string;
//     country?: string;
//     postalCode?: string;
//     latitude?: number;
//     longitude?: number;
//     placeId?: string;
// }

// interface AddressAutocompleteProps {
//     apiKey: string;
//     onAddressSelect: (address: AddressDetails) => void;
//     placeholder?: string;
//     defaultValue?: string;
//     className?: string;
//     disabled?: boolean;
//     // Restrict to specific country (e.g., 'ng' for Nigeria)
//     country?: string;
// }

// export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
//     apiKey,
//     onAddressSelect,
//     placeholder = "Enter delivery address",
//     defaultValue = "",
//     className = "",
//     disabled = false,
//     country = "ng", // Default to Nigeria
// }) => {
//     const inputRef = useRef<HTMLInputElement>(null);
//     const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

//     const { isLoaded, error } = useGooglePlaces({ apiKey });
//     const [inputValue, setInputValue] = useState(defaultValue);

//     useEffect(() => {
//         if (!isLoaded || !inputRef.current) return;

//         // Initialize autocomplete
//         const options: google.maps.places.AutocompleteOptions = {
//             componentRestrictions: { country }, // Restrict to specific country
//             fields: [
//                 'address_components',
//                 'formatted_address',
//                 'geometry',
//                 'place_id',
//                 'name'
//             ],
//             types: ['address'], // Only show addresses (not businesses)
//         };

//         autocompleteRef.current = new google.maps.places.Autocomplete(
//             inputRef.current,
//             options
//         );

//         // Listen for place selection
//         const listener = autocompleteRef.current.addListener('place_changed', () => {
//             const place: PlaceResult = autocompleteRef.current?.getPlace() || {};

//             if (!place.address_components) {
//                 console.error('No address components found');
//                 return;
//             }

//             // Parse address components
//             const addressDetails = parseAddressComponents(place);

//             // Update input value
//             setInputValue(place.formatted_address || '');

//             // Callback with parsed address
//             onAddressSelect(addressDetails);
//         });

//         // Cleanup
//         return () => {
//             if (listener) {
//                 google.maps.event.removeListener(listener);
//             }
//         };
//     }, [isLoaded, onAddressSelect, country]);

//     // Parse Google Place result into structured address
//     const parseAddressComponents = (place: PlaceResult): AddressDetails => {
//         const components = place.address_components || [];

//         const getComponent = (type: string, format: 'long' | 'short' = 'long') => {
//             const component = components.find((c) => c.types.includes(type));
//             return format === 'long' ? component?.long_name : component?.short_name;
//         };

//         return {
//             fullAddress: place.formatted_address || '',
//             street: [
//                 getComponent('street_number'),
//                 getComponent('route')
//             ].filter(Boolean).join(' '),
//             city: getComponent('locality') || getComponent('administrative_area_level_2'),
//             state: getComponent('administrative_area_level_1'),
//             country: getComponent('country'),
//             postalCode: getComponent('postal_code'),
//             latitude: place.geometry?.location.lat(),
//             longitude: place.geometry?.location.lng(),
//             placeId: place.place_id,
//         };
//     };

//     if (error) {
//         return (
//             <div className="text-red-600 text-sm">
//                 Error loading address autocomplete: {error}
//             </div>
//         );
//     }

//     if (!isLoaded) {
//         return (
//             <div className="relative">
//                 <input
//                     type="text"
//                     placeholder="Loading address autocomplete..."
//                     disabled
//                     className={`w-full px-4 py-3 pl-10 border rounded-lg bg-gray-100 ${className}`}
//                 />
//                 <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
//             </div>
//         );
//     }

//     return (
//         <div className="relative">
//             <input
//                 ref={inputRef}
//                 type="text"
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//                 placeholder={placeholder}
//                 disabled={disabled}
//                 className={`w-full px-4 py-3 pl-10 border- border-gray-300 rounded-lg bg-white placeholder:text-sm focus:outline-none ${className}`}
//             />
//             <MapPin className="absolute left-3 top-3.5 text-gray-500" size={20} />
//         </div>
//     );
// };

// // Export helper function for manual geocoding
// export const geocodeAddress = async (
//     address: string,
//     apiKey: string
// ): Promise<AddressDetails | null> => {
//     try {
//         const response = await fetch(
//             `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
//         );
//         const data = await response.json();

//         if (data.status === 'OK' && data.results[0]) {
//             const place = data.results[0];
//             const components = place.address_components || [];

//             const getComponent = (type: string) => {
//                 const component = components.find((c: any) => c.types.includes(type));
//                 return component?.long_name;
//             };

//             return {
//                 fullAddress: place.formatted_address,
//                 street: [
//                     getComponent('street_number'),
//                     getComponent('route')
//                 ].filter(Boolean).join(' '),
//                 city: getComponent('locality') || getComponent('administrative_area_level_2'),
//                 state: getComponent('administrative_area_level_1'),
//                 country: getComponent('country'),
//                 postalCode: getComponent('postal_code'),
//                 latitude: place.geometry.location.lat,
//                 longitude: place.geometry.location.lng,
//                 placeId: place.place_id,
//             };
//         }

//         return null;
//     } catch (error) {
//         console.error('Geocoding error:', error);
//         return null;
//     }
// };