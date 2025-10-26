// // src/hooks/useGooglePlaces.ts
// import { useEffect, useState } from 'react';

// interface GooglePlacesHookOptions {
//     apiKey: string;
//     libraries?: string[];
// }

// /**
//  * Hook to load Google Places API script
//  * Usage: const isLoaded = useGooglePlaces({ apiKey: 'YOUR_API_KEY' });
//  */
// export const useGooglePlaces = ({
//     apiKey,
//     libraries = ['places']
// }: GooglePlacesHookOptions) => {
//     const [isLoaded, setIsLoaded] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         // Check if already loaded
//         if (window.google && window.google.maps && window.google.maps.places) {
//             setIsLoaded(true);
//             return;
//         }

//         // Check if script is already being loaded
//         const existingScript = document.querySelector(
//             `script[src*="maps.googleapis.com"]`
//         );

//         if (existingScript) {
//             existingScript.addEventListener('load', () => setIsLoaded(true));
//             return;
//         }

//         // Create and load script
//         const script = document.createElement('script');
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`;
//         script.async = true;
//         script.defer = true;

//         script.onload = () => {
//             setIsLoaded(true);
//         };

//         script.onerror = () => {
//             setError('Failed to load Google Maps script');
//         };

//         document.head.appendChild(script);

//         return () => {
//             // Cleanup if needed (optional, usually not necessary)
//         };
//     }, [apiKey, libraries]);

//     return { isLoaded, error };
// };

// // Type definitions for Google Places API
// declare global {
//     interface Window {
//         google: typeof google;
//     }
// }

// export interface PlaceResult {
//     formatted_address?: string;
//     address_components?: Array<{
//         long_name: string;
//         short_name: string;
//         types: string[];
//     }>;
//     geometry?: {
//         location: {
//             lat: () => number;
//             lng: () => number;
//         };
//     };
//     place_id?: string;
//     name?: string;
// }