/// <reference types="../vite-env" />
import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, X, ThumbsUp, Search } from 'lucide-react';
import type { LocationOption } from '../types/block';

interface LocationBlockProps {
  options: LocationOption[];
  editable?: boolean;
  currentUserId?: string;
  participantNames?: Map<string, string>; // Map of participantId -> participantName
  allowParticipantSuggestions?: boolean;
  onOptionsChange?: (options: LocationOption[]) => void;
  onSettingsChange?: (settings: { allowParticipantSuggestions: boolean }) => void;
}

interface LocationSuggestion {
  placeId: string;
  name: string;
  address: string;
  mapsLink?: string;
}

export default function LocationBlock({
  options,
  editable = true,
  currentUserId,
  participantNames,
  allowParticipantSuggestions = true,
  onOptionsChange,
  onSettingsChange
}: LocationBlockProps) {
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>(options);
  const [newLocation, setNewLocation] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userCountry, setUserCountry] = useState<string>('us');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        inputRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user's location for proximity bias
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setUserLocation({ lat, lng });

          // Reverse geocode to get country code
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data.address?.country_code) {
              setUserCountry(data.address.country_code.toLowerCase());
            }
          } catch (error) {
            console.warn('Failed to detect country:', error);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        }
      );
    }
  }, []);

  // Load Google Maps API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('Google Maps API key not found, using Nominatim fallback only');
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      initializeGoogleServices();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogleServices);
      return;
    }

    // Load Google Maps script only once
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleServices;
    script.onerror = () => {
      console.warn('Failed to load Google Maps, using Nominatim fallback');
    };

    document.head.appendChild(script);
  }, []);

  const initializeGoogleServices = () => {
    if (window.google?.maps?.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();

      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(dummyDiv);

      setGoogleLoaded(true);
    }
  };

  // Search for locations using Google Places or Nominatim
  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Try Google Places first
    if (googleLoaded && autocompleteService.current) {
      setIsLoadingGoogle(true);
      try {
        const request: google.maps.places.AutocompletionRequest = {
          input: query,
          types: ['establishment', 'geocode']
        };

        // Add country restriction for better locality
        request.componentRestrictions = {
          country: userCountry
        };

        // Add location restriction (hard limit) if user location is available
        if (userLocation && window.google?.maps?.LatLng) {
          const center = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
          request.locationRestriction = {
            center: center,
            radius: 100000 // 100km radius restriction (hard limit)
          };
          // Also add location bias for ranking within the restriction
          request.location = center;
          request.radius = 50000; // 50km for priority ranking
        }

        autocompleteService.current.getPlacePredictions(
          request,
          (predictions, status) => {
            setIsLoadingGoogle(false);

            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              const googleSuggestions: LocationSuggestion[] = predictions.slice(0, 5).map(p => ({
                placeId: p.place_id,
                name: p.structured_formatting.main_text,
                address: p.structured_formatting.secondary_text || p.description,
                mapsLink: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
              }));

              setSuggestions(googleSuggestions);
              setShowSuggestions(true);
            } else {
              // Fallback to Nominatim if Google fails
              searchNominatim(query);
            }
          }
        );
      } catch (error) {
        console.error('Google Places error:', error);
        searchNominatim(query);
      }
    } else {
      // Use Nominatim if Google is not available
      searchNominatim(query);
    }
  };

  // Fallback to Nominatim (OpenStreetMap)
  const searchNominatim = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'Alignr Event Planning App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const nominatimSuggestions: LocationSuggestion[] = data.map((place: any) => ({
          placeId: place.place_id.toString(),
          name: place.name || place.display_name.split(',')[0],
          address: place.display_name,
          mapsLink: `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}`
        }));

        setSuggestions(nominatimSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Nominatim search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounced search
  const handleLocationInput = (value: string) => {
    setNewLocation(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 500); // 500ms debounce
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const newOption: LocationOption = {
      id: Date.now().toString(),
      label: suggestion.name,
      name: suggestion.name,
      address: suggestion.address,
      mapsLink: suggestion.mapsLink,
      votes: []
    };

    const updatedOptions = [...locationOptions, newOption];
    setLocationOptions(updatedOptions);
    onOptionsChange?.(updatedOptions);

    setNewLocation('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;

    const newOption: LocationOption = {
      id: Date.now().toString(),
      label: newLocation,
      name: newLocation,
      votes: []
    };

    const updatedOptions = [...locationOptions, newOption];
    setLocationOptions(updatedOptions);
    onOptionsChange?.(updatedOptions);

    setNewLocation('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRemoveLocation = (optionId: string) => {
    const updatedOptions = locationOptions.filter(opt => opt.id !== optionId);
    setLocationOptions(updatedOptions);
    onOptionsChange?.(updatedOptions);
  };

  const handleVote = (optionId: string) => {
    if (!currentUserId) return;

    const updatedOptions = locationOptions.map(opt => {
      if (opt.id === optionId) {
        const hasVoted = opt.votes.includes(currentUserId);
        return {
          ...opt,
          votes: hasVoted
            ? opt.votes.filter(id => id !== currentUserId)
            : [...opt.votes, currentUserId]
        };
      }
      return opt;
    });

    setLocationOptions(updatedOptions);
    onOptionsChange?.(updatedOptions);
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="w-5 h-5 text-[#75619D]" strokeWidth={2} />
        <h3 className="text-lg font-semibold text-[#1E1E2F]">Location Options</h3>
      </div>

      {/* Location options list */}
      <div className="space-y-2 mb-4">
        {locationOptions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No locations added yet. Add some options below!
          </p>
        ) : (
          locationOptions.map(option => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1E1E2F]">{option.name}</p>
                    {option.address && (
                      <p className="text-xs text-gray-500 mt-0.5">{option.address}</p>
                    )}
                    {option.mapsLink && (
                      <a
                        href={option.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#75619D] hover:underline mt-1 inline-block"
                      >
                        View on map →
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 ml-4">
                <div className="flex items-center space-x-2">
                  <div className="relative group">
                    <button
                      onClick={() => handleVote(option.id)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        currentUserId && option.votes.includes(currentUserId)
                          ? 'bg-[#75619D] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      disabled={!currentUserId}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{option.votes.length}</span>
                    </button>

                    {/* Show voter names to organizer on hover */}
                    {editable && option.votes.length > 0 && participantNames && (
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-10 shadow-lg">
                        <div className="font-medium mb-1">Voted by:</div>
                        {option.votes.map(voterId => participantNames.get(voterId) || 'Unknown').join(', ')}
                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>

                  {editable && (
                    <button
                      onClick={() => handleRemoveLocation(option.id)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                      title="Remove location"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add new location */}
      {(editable || allowParticipantSuggestions) && (
        <div className="relative">
          {/* Allow participant suggestions checkbox (organizer only) */}
          {editable && (
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="allow-participant-suggestions"
                checked={allowParticipantSuggestions}
                onChange={(e) => {
                  onSettingsChange?.({ allowParticipantSuggestions: e.target.checked });
                }}
                className="w-4 h-4 text-[#75619D] bg-gray-100 border-gray-300 rounded focus:ring-[#75619D] focus:ring-2"
              />
              <label htmlFor="allow-participant-suggestions" className="text-sm text-gray-600 cursor-pointer select-none">
                Allow participants to suggest locations
              </label>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={newLocation}
                  onChange={(e) => handleLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !showSuggestions) {
                      handleAddLocation();
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Search for a location..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent"
                />
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.placeId + index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#75619D] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[#1E1E2F]">{suggestion.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{suggestion.address}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleAddLocation}
              disabled={!newLocation.trim()}
              className="px-4 py-2 bg-[#75619D] text-white rounded-lg hover:bg-[#624F8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {isLoadingGoogle && (
            <p className="text-xs text-gray-500 mt-2">Searching locations...</p>
          )}
        </div>
      )}

      {!currentUserId && locationOptions.length > 0 && (
        <div className="mt-4 text-xs text-gray-400 italic ">
          Sign in to vote for locations
        </div>
      )}
    </div>
  );
}
