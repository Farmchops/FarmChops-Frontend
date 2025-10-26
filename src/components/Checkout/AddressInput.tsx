// // src/components/Checkout/AddressInput.tsx
// import React, { useState } from 'react';
// import { MapPin, Edit3 } from 'lucide-react';
// import { AddressAutocomplete, type AddressDetails } from './AddressAutocomplete';

// interface AddressInputProps {
//     apiKey: string;
//     value: string;
//     city: string;
//     state: string;
//     onAddressChange: (addressDetails: Partial<AddressDetails>) => void;
//     disabled?: boolean;
//     required?: boolean;
// }

// export const AddressInput: React.FC<AddressInputProps> = ({
//     apiKey,
//     value,
//     city,
//     state,
//     onAddressChange,
//     disabled = false,
//     required = true,
// }) => {
//     const [useAutocomplete, setUseAutocomplete] = useState(true);
//     const [manualAddress, setManualAddress] = useState(value);
//     const [manualCity, setManualCity] = useState(city);
//     const [manualState, setManualState] = useState(state);

//     const handleAutocompleteSelect = (addressDetails: AddressDetails) => {
//         onAddressChange({
//             fullAddress: addressDetails.fullAddress,
//             city: addressDetails.city,
//             state: addressDetails.state,
//             latitude: addressDetails.latitude,
//             longitude: addressDetails.longitude,
//         });
//     };

//     const handleManualChange = () => {
//         onAddressChange({
//             fullAddress: manualAddress,
//             city: manualCity,
//             state: manualState,
//         });
//     };

//     return (
//         <div className="space-y-4">
//             {/* Toggle Button */}
//             <div className="flex items-center justify-between mb-2">
//                 <label className="block text-sm font-medium">
//                     Delivery Address {required && <span className="text-red-500">*</span>}
//                 </label>
//                 <button
//                     type="button"
//                     onClick={() => setUseAutocomplete(!useAutocomplete)}
//                     className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
//                 >
//                     {useAutocomplete ? (
//                         <>
//                             <Edit3 size={14} /> Enter Manually
//                         </>
//                     ) : (
//                         <>
//                             <MapPin size={14} /> Use Autocomplete
//                         </>
//                     )}
//                 </button>
//             </div>

//             {useAutocomplete ? (
//                 /* Google Autocomplete */
//                 <div>
//                     <AddressAutocomplete
//                         apiKey={apiKey}
//                         onAddressSelect={handleAutocompleteSelect}
//                         placeholder="Start typing your address (e.g., Victoria Island, Lagos)"
//                         defaultValue={value}
//                         country="ng"
//                         disabled={disabled}
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                         💡 Start typing to see suggestions from Google
//                     </p>
//                 </div>
//             ) : (
//                 /* Manual Input */
//                 <div className="space-y-3">
//                     <div>
//                         <input
//                             type="text"
//                             value={manualAddress}
//                             onChange={(e) => {
//                                 setManualAddress(e.target.value);
//                                 handleManualChange();
//                             }}
//                             placeholder="Street address (e.g., 123 Main Street, Lekki)"
//                             disabled={disabled}
//                             required={required}
//                             className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
//                         />
//                     </div>
//                     <div className="grid grid-cols-2 gap-3">
//                         <div>
//                             <input
//                                 type="text"
//                                 value={manualCity}
//                                 onChange={(e) => {
//                                     setManualCity(e.target.value);
//                                     handleManualChange();
//                                 }}
//                                 placeholder="City (e.g., Lagos)"
//                                 disabled={disabled}
//                                 className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
//                             />
//                         </div>
//                         <div>
//                             <input
//                                 type="text"
//                                 value={manualState}
//                                 onChange={(e) => {
//                                     setManualState(e.target.value);
//                                     handleManualChange();
//                                 }}
//                                 placeholder="State (e.g., Lagos State)"
//                                 disabled={disabled}
//                                 className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
//                             />
//                         </div>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                         📝 Manually enter your complete delivery address
//                     </p>
//                 </div>
//             )}

//             {/* Display Selected Address */}
//             {value && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//                     <p className="text-sm font-medium text-green-900">Selected Address:</p>
//                     <p className="text-sm text-green-700 mt-1">{value}</p>
//                     {city && state && (
//                         <p className="text-xs text-green-600 mt-1">
//                             {city}, {state}
//                         </p>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };