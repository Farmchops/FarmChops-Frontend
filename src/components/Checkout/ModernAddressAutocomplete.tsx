// // src/components/Checkout/ModernAddressAutocomplete.tsx

// import React, { useEffect, useRef, useState } from 'react';
// import { MapPin } from 'lucide-react';
// import { useGooglePlaces } from '@/hooks/useGooglePlaces';

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

// interface ModernAddressAutocompleteProps {
//     apiKey: string;
//     onAddressSelect: (address: AddressDetails) => void;
//     placeholder?: string;
//     defaultValue?: string;
//     className?: string;
//     disabled?: boolean;
//     country?: string;
// }

// export const ModernAddressAutocomplete: React.FC<ModernAddressAutocompleteProps> = ({
//     apiKey,
//     onAddressSelect,
//     placeholder = "Enter delivery address",
//     defaultValue = "",
//     className = "",
//     disabled = false,
//     country = "ng",
// }) => {
//     const containerRef = useRef<HTMLDivElement>(null);
//     const inputRef = useRef<HTMLInputElement>(null);
//     const autocompleteElementRef = useRef<any>(null);

//     const { isLoaded, error } = useGooglePlaces({ apiKey });
//     const [inputValue, setInputValue] = useState(defaultValue);

//     useEffect(() => {
//         if (!isLoaded || !containerRef.current || disabled) return;

//         // Create the new PlaceAutocompleteElement
//         const autocompleteElement = document.createElement('gmp-place-autocomplete') as any;

//         // Set attributes
//         autocompleteElement.setAttribute('country', country);
//         autocompleteElement.setAttribute('placeholder', placeholder);
//         if (defaultValue) {
//             autocompleteElement.setAttribute('value', defaultValue);
//         }

//         // Style the element to match your design
//         autocompleteElement.style.width = '100%';
//         autocompleteElement.style.border = '1px solid #d1d5db';
//         autocompleteElement.style.borderRadius = '0.5rem';
//         autocompleteElement.style.padding = '0.75rem 1rem';
//         autocompleteElement.style.paddingLeft = '2.5rem';
//         autocompleteElement.style.fontSize = '1rem';

//         // Listen for place selection
//         autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
//             const place = event.place;

//             if (!place || !place.addressComponents) {
//                 console.error('No address components found');
//                 return;
//             }

//             // Parse the place details
//             const addressDetails = parsePlaceResult(place);

//             // Update input value
//             setInputValue(place.formattedAddress || '');

//             // Callback with parsed address
//             onAddressSelect(addressDetails);
//         });

//         // Clear container and add element
//         containerRef.current.innerHTML = '';
//         containerRef.current.appendChild(autocompleteElement);

//         autocompleteElementRef.current = autocompleteElement;

//         return () => {
//             if (autocompleteElement.parentNode) {
//                 autocompleteElement.parentNode.removeChild(autocompleteElement);
//             }
//         };
//     }, [isLoaded, onAddressSelect, country, placeholder, defaultValue, disabled]);

//     // Parse place result into structured address
//     const parsePlaceResult = (place: any): AddressDetails => {
//         const components = place.addressComponents || [];

//         const getComponent = (type: string, format: 'long' | 'short' = 'long') => {
//             const component = components.find((c: any) => c.types.includes(type));
//             return format === 'long' ? component?.longText : component?.shortText;
//         };

//         return {
//             fullAddress: place.formattedAddress || '',
//             street: [
//                 getComponent('street_number'),
//                 getComponent('route')
//             ].filter(Boolean).join(' '),
//             city: getComponent('locality') || getComponent('administrative_area_level_2'),
//             state: getComponent('administrative_area_level_1'),
//             country: getComponent('country'),
//             postalCode: getComponent('postal_code'),
//             latitude: place.location?.lat(),
//             longitude: place.location?.lng(),
//             placeId: place.id,
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
//             <MapPin className="absolute left-3 top-3.5 text-gray-500 z-10 pointer-events-none" size={20} />
//             <div ref={containerRef} className={`modern-autocomplete ${className}`} />

//             {/* Add custom styling */}
//             <style>{`
//                 .modern-autocomplete gmp-place-autocomplete {
//                     width: 100%;
//                 }
//                 .modern-autocomplete gmp-place-autocomplete:focus-within {
//                     outline: 2px solid #16a34a;
//                     outline-offset: -1px;
//                 }
//             `}</style>
//         </div>
//     );
// };