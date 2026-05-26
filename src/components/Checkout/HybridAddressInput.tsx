// src/components/Checkout/HybridAddressInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Edit3, Search } from 'lucide-react';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? import.meta.env.VITE_API_BASE_URL;
const DEFAULT_ADDRESS_SEARCH_ENDPOINT = `${API_BASE_URL.replace(/\/$/, '')}/addresses/search`;

interface AddressDetails {
    fullAddress: string;
    area?: string;
    city?: string;
    state?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    country?: string;
    postalCode?: string;
}

interface AddressSuggestion {
    id: string;
    name: string;
    fullAddress: string;
    area?: string;
    city?: string;
    state?: string;
    landmark?: string;
    source: 'custom' | 'google';
    coordinates?: {
        lat: number;
        lng: number;
    };
}

interface HybridAddressInputProps {
    value: string;
    onAddressSelect: (address: AddressDetails) => void;
    onAddressChange: (value: string) => void;
    googleApiKey?: string;
    customApiEndpoint?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const HybridAddressInput: React.FC<HybridAddressInputProps> = ({
    value,
    onAddressSelect,
    onAddressChange,
    googleApiKey,
    customApiEndpoint = DEFAULT_ADDRESS_SEARCH_ENDPOINT,
    placeholder = "Search for your address...",
    disabled = false,
}) => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualAddress, setManualAddress] = useState({
        street: '',
        area: '',
        city: '',
        state: '',
        landmark: '',
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch suggestions from custom backend
    const fetchCustomSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
        try {
            const response = await fetch(`${customApiEndpoint}?q=${encodeURIComponent(query)}`);
            if (!response.ok) return [];

            const data = await response.json();

            // Transform backend response to our format
            return (data.addresses || []).map((addr: {
                _id: string;
                name: string;
                area: string;
                city: string;
                state: string;
                landmark?: string;
                coordinates?: { lat: number; lng: number };
            }) => ({
                id: addr._id,
                name: addr.name,
                fullAddress: `${addr.name}, ${addr.area}, ${addr.city}, ${addr.state}`,
                area: addr.area,
                city: addr.city,
                state: addr.state,
                landmark: addr.landmark,
                source: 'custom' as const,
                coordinates: addr.coordinates,
            }));
        } catch (error) {
            console.error('Custom address search failed:', error);
            return [];
        }
    };

    // Fetch suggestions from Google Places
    const fetchGoogleSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
        // Type guard for google maps
        const windowWithGoogle = window as typeof window & {
            google?: {
                maps?: {
                    places?: {
                        AutocompleteService: new () => {
                            getPlacePredictions: (
                                request: { input: string; componentRestrictions?: { country: string }; types: string[] },
                                callback: (predictions: Array<{
                                    place_id: string;
                                    description: string;
                                    structured_formatting: { main_text: string };
                                }> | null, status: string) => void
                            ) => void;
                        };
                        PlacesServiceStatus: { OK: string };
                    };
                };
            };
        };

        if (!googleApiKey || !windowWithGoogle.google?.maps?.places) return [];

        const googlePlaces = windowWithGoogle.google.maps.places;

        return new Promise((resolve) => {
            const service = new googlePlaces.AutocompleteService();

            service.getPlacePredictions(
                {
                    input: query,
                    componentRestrictions: { country: 'ng' },
                    types: ['geocode', 'establishment'],
                },
                (predictions, status) => {
                    if (status !== windowWithGoogle.google?.maps?.places?.PlacesServiceStatus.OK || !predictions) {
                        resolve([]);
                        return;
                    }

                    resolve(
                        predictions.slice(0, 3).map((prediction) => ({
                            id: prediction.place_id,
                            name: prediction.structured_formatting.main_text,
                            fullAddress: prediction.description,
                            source: 'google' as const,
                        }))
                    );
                }
            );
        });
    };

    // Combined search: Custom DB → Google → Merge results
    const searchAddresses = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);

        try {
            // Search both sources in parallel
            const [customResults, googleResults] = await Promise.all([
                fetchCustomSuggestions(query),
                fetchGoogleSuggestions(query),
            ]);

            // Prioritize custom results, then add Google results
            const combined = [
                ...customResults,
                ...googleResults,
            ].slice(0, 8); // Limit to 8 total suggestions

            setSuggestions(combined);
            setShowSuggestions(combined.length > 0);
        } catch (error) {
            console.error('Address search failed:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced input handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onAddressChange(newValue);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce search by 300ms
        debounceTimer.current = setTimeout(() => {
            searchAddresses(newValue);
        }, 300);
    };

    const fetchGooglePlaceDetails = (placeId: string): Promise<{ country?: string; postalCode?: string; city?: string; state?: string; sublocality?: string }> => {
        const googleWindow = window as typeof window & { google?: { maps?: { places?: { PlacesService: new (el: Element) => { getDetails: (req: { placeId: string; fields: string[] }, cb: (place: { address_components?: Array<{ long_name: string; types: string[] }> } | null, status: string) => void ) => void }; PlacesServiceStatus: { OK: string } } } } };
        const places = googleWindow.google?.maps?.places;
        if (!places) return Promise.resolve({});

        return new Promise((resolve) => {
            const service = new places.PlacesService(document.createElement('div'));
            service.getDetails({ placeId, fields: ['address_components'] }, (place, status) => {
                if (status !== places.PlacesServiceStatus.OK || !place?.address_components) {
                    resolve({});
                    return;
                }
                const result: { country?: string; postalCode?: string; city?: string; state?: string; sublocality?: string } = {};
                for (const c of place.address_components) {
                    if (c.types.includes('country')) result.country = c.long_name;
                    if (c.types.includes('postal_code')) result.postalCode = c.long_name;
                    if (c.types.includes('locality')) result.city = c.long_name;
                    if (c.types.includes('administrative_area_level_1')) result.state = c.long_name;
                    if (c.types.includes('sublocality_level_1') && !result.sublocality) result.sublocality = c.long_name;
                    if (c.types.includes('neighborhood') && !result.sublocality) result.sublocality = c.long_name;
                }
                resolve(result);
            });
        });
    };

    // Handle suggestion selection
    const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
        setShowSuggestions(false);

        let extra: { country?: string; postalCode?: string; city?: string; state?: string; sublocality?: string } = {};
        if (suggestion.source === 'google') {
            extra = await fetchGooglePlaceDetails(suggestion.id);
        }

        // For Google suggestions, build a clean address from components to avoid
        // Google injecting "Abuja Municipal Area Council" into the description string.
        // Custom suggestions are already well-formed so use them as-is.
        let fullAddress: string;
        if (suggestion.source === 'google') {
            const areaHint = extra.sublocality;
            const parts = [suggestion.name];
            if (areaHint) parts.push(areaHint);
            if (extra.city) parts.push(extra.city);
            if (extra.state) parts.push(extra.state);
            if (extra.country) parts.push(extra.country);
            fullAddress = parts.filter(Boolean).join(', ');
        } else {
            fullAddress = suggestion.fullAddress;
        }

        onAddressChange(fullAddress);

        onAddressSelect({
            fullAddress,
            area: suggestion.area || extra.sublocality,
            city: extra.city || suggestion.city,
            state: extra.state || suggestion.state,
            landmark: suggestion.landmark,
            latitude: suggestion.coordinates?.lat,
            longitude: suggestion.coordinates?.lng,
            country: extra.country,
            postalCode: extra.postalCode,
        });
    };

    // Handle manual entry submission
    const handleManualSubmit = () => {
        const fullAddress = [
            manualAddress.street,
            manualAddress.area,
            manualAddress.city,
            manualAddress.state,
        ].filter(Boolean).join(', ');

        onAddressChange(fullAddress);
        setShowManualEntry(false);

        onAddressSelect({
            fullAddress,
            area: manualAddress.area,
            city: manualAddress.city,
            state: manualAddress.state,
            landmark: manualAddress.landmark,
        });
    };

    if (showManualEntry) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Enter Address Manually</label>
                    <button
                        type="button"
                        onClick={() => setShowManualEntry(false)}
                        className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                        <Search size={14} /> Back to Search
                    </button>
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Street address (e.g., Building 5, Moremi Hall)"
                        value={manualAddress.street}
                        onChange={(e) => setManualAddress({ ...manualAddress, street: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Area/Neighborhood (e.g., Wuse, Jabi, Gwarinpa)"
                        value={manualAddress.area}
                        onChange={(e) => setManualAddress({ ...manualAddress, area: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="City (e.g., Abuja)"
                            value={manualAddress.city}
                            onChange={(e) => setManualAddress({ ...manualAddress, city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-sm"
                        />
                        <input
                            type="text"
                            placeholder="State (e.g., FCT)"
                            value={manualAddress.state}
                            onChange={(e) => setManualAddress({ ...manualAddress, state: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-sm"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Landmark (Optional, e.g., Opposite Fire Station)"
                        value={manualAddress.landmark}
                        onChange={(e) => setManualAddress({ ...manualAddress, landmark: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-sm"
                    />
                    <button
                        type="button"
                        onClick={handleManualSubmit}
                        disabled={!manualAddress.street || !manualAddress.city || !manualAddress.state}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        Use This Address
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => value.length >= 2 && searchAddresses(value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-sm"
                />
                {isLoading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {suggestion.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {suggestion.fullAddress}
                                    </p>
                                    {suggestion.source === 'custom' && (
                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                            ✓ Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Manual Entry Toggle */}
            <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    {isLoading ? 'Searching...' : `Type to search ${suggestions.length > 0 ? `(${suggestions.length} found)` : ''}`}
                </p>
                <button
                    type="button"
                    onClick={() => setShowManualEntry(true)}
                    className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                    <Edit3 size={12} /> Can't find? Enter manually
                </button>
            </div>
        </div>
    );
};
