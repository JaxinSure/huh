// Global variables
let map;
let geocoder;
let placesService;
let markers = [];
let savedLocations = [];
let infoWindow;
let currentLocationMarker;

// Initialize the map
function initMap() {
    // Default location (San Francisco)
    const defaultLocation = { lat: 37.7749, lng: -122.4194 };

    // Create map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
            }
        ],
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
        },
        fullscreenControl: true,
    });

    // Initialize services
    geocoder = new google.maps.Geocoder();
    placesService = new google.maps.places.PlacesService(map);
    infoWindow = new google.maps.InfoWindow();

    // Set up event listeners
    setupEventListeners();

    // Update coordinates display on map movement
    map.addListener('center_changed', updateCoordinatesDisplay);
    map.addListener('click', onMapClick);

    // Try to get user's current location
    getCurrentLocation();

    console.log('Google Maps initialized successfully!');
}

// Set up all event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Map type selector
    document.getElementById('mapType').addEventListener('change', (e) => {
        map.setMapTypeId(e.target.value);
    });

    // Current location button
    document.getElementById('getCurrentLocation').addEventListener('click', getCurrentLocation);

    // Clear markers button
    document.getElementById('clearMarkers').addEventListener('click', clearAllMarkers);

    // Quick places buttons
    document.querySelectorAll('.quick-place-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            searchLocation(e.target.dataset.place);
        });
    });
}

// Perform search based on input
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) {
        showNotification('Please enter a search term', 'warning');
        return;
    }

    showLoadingState(true);
    searchLocation(query);
}

// Search for a location
function searchLocation(query) {
    const request = {
        query: query,
        fields: ['name', 'geometry', 'formatted_address', 'place_id', 'types']
    };

    placesService.findPlaceFromQuery(request, (results, status) => {
        showLoadingState(false);

        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];
            const location = place.geometry.location;

            // Center map on the location
            map.setCenter(location);
            map.setZoom(15);

            // Add marker
            addMarker(location, place.name, place.formatted_address, place.place_id);

            // Clear search input
            document.getElementById('searchInput').value = '';

            showNotification(`Found: ${place.name}`, 'success');
        } else {
            // Fallback to geocoding
            geocodeLocation(query);
        }
    });
}

// Geocode a location (fallback)
function geocodeLocation(address) {
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            const formattedAddress = results[0].formatted_address;

            map.setCenter(location);
            map.setZoom(15);

            addMarker(location, address, formattedAddress);
            showNotification(`Found: ${formattedAddress}`, 'success');
        } else {
            showNotification('Location not found. Please try a different search term.', 'error');
        }
    });
}

// Add a marker to the map
function addMarker(location, title, address, placeId = null) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP
    });

    // Create info window content
    const infoContent = createInfoWindowContent(title, address, location, placeId);

    marker.addListener('click', () => {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, marker);

        // Set up info window button listeners after it opens
        setTimeout(() => {
            setupInfoWindowListeners(location, title, address);
        }, 100);
    });

    markers.push({
        marker: marker,
        title: title,
        address: address,
        location: location,
        placeId: placeId
    });

    return marker;
}

// Create info window content
function createInfoWindowContent(title, address, location, placeId) {
    return `
        <div class="custom-info-window">
            <h4 class="info-title">${title}</h4>
            <p class="info-address">${address}</p>
            <div class="info-actions">
                <button class="info-btn save-location" data-title="${title}" data-address="${address}" data-lat="${location.lat()}" data-lng="${location.lng()}">
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
                <button class="info-btn get-directions" data-lat="${location.lat()}" data-lng="${location.lng()}">
                    <i class="fas fa-directions"></i>
                    Directions
                </button>
            </div>
        </div>
    `;
}

// Setup info window button listeners
function setupInfoWindowListeners(location, title, address) {
    const saveBtn = document.querySelector('.save-location');
    const directionsBtn = document.querySelector('.get-directions');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveLocation(title, address, location);
        });
    }

    if (directionsBtn) {
        directionsBtn.addEventListener('click', () => {
            getDirections(location);
        });
    }
}

// Save a location
function saveLocation(title, address, location) {
    const locationData = {
        id: Date.now(),
        title: title,
        address: address,
        lat: location.lat(),
        lng: location.lng()
    };

    // Check if location already exists
    const exists = savedLocations.some(loc => 
        Math.abs(loc.lat - locationData.lat) < 0.0001 && 
        Math.abs(loc.lng - locationData.lng) < 0.0001
    );

    if (exists) {
        showNotification('Location already saved!', 'warning');
        return;
    }

    savedLocations.push(locationData);
    updateSavedLocationsList();
    showNotification('Location saved successfully!', 'success');

    // Store in localStorage
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
}

// Update saved locations list in sidebar
function updateSavedLocationsList() {
    const markersList = document.getElementById('markersList');
    
    if (savedLocations.length === 0) {
        markersList.innerHTML = '<p class="no-markers">No saved locations yet</p>';
        return;
    }

    markersList.innerHTML = savedLocations.map(location => `
        <div class="marker-item" data-id="${location.id}">
            <div class="marker-title">${location.title}</div>
            <div class="marker-address">${location.address}</div>
            <div class="marker-actions" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                <button class="info-btn" onclick="goToLocation(${location.lat}, ${location.lng})" style="flex: 1; font-size: 0.7rem; padding: 0.25rem;">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="info-btn" onclick="removeSavedLocation(${location.id})" style="flex: 1; font-size: 0.7rem; padding: 0.25rem; background: #fee2e2; color: #dc2626;">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
}

// Go to a specific location
function goToLocation(lat, lng) {
    const location = new google.maps.LatLng(lat, lng);
    map.setCenter(location);
    map.setZoom(15);
    
    // Add a temporary marker if one doesn't exist at this location
    const existingMarker = markers.find(m => 
        Math.abs(m.location.lat() - lat) < 0.0001 && 
        Math.abs(m.location.lng() - lng) < 0.0001
    );
    
    if (!existingMarker) {
        addMarker(location, 'Saved Location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
}

// Remove saved location
function removeSavedLocation(id) {
    savedLocations = savedLocations.filter(loc => loc.id !== id);
    updateSavedLocationsList();
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    showNotification('Location removed', 'success');
}

// Get directions to a location
function getDirections(destination) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat()},${destination.lng()}`;
    window.open(url, '_blank');
}

// Get current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser.', 'error');
        return;
    }

    showLoadingState(true);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            showLoadingState(false);
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setCenter(location);
            map.setZoom(15);

            // Remove previous current location marker
            if (currentLocationMarker) {
                currentLocationMarker.setMap(null);
            }

            // Add current location marker
            currentLocationMarker = new google.maps.Marker({
                position: location,
                map: map,
                title: 'Your Current Location',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                }
            });

            showNotification('Current location found!', 'success');
        },
        (error) => {
            showLoadingState(false);
            let message = 'Error getting current location: ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Position unavailable';
                    break;
                case error.TIMEOUT:
                    message += 'Request timeout';
                    break;
                default:
                    message += 'Unknown error';
                    break;
            }
            showNotification(message, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// Clear all markers
function clearAllMarkers() {
    markers.forEach(markerData => {
        markerData.marker.setMap(null);
    });
    markers = [];
    
    if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
        currentLocationMarker = null;
    }
    
    infoWindow.close();
    showNotification('All markers cleared', 'success');
}

// Handle map click
function onMapClick(event) {
    const location = event.latLng;
    
    // Reverse geocode to get address
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
            const address = results[0].formatted_address;
            const title = 'Clicked Location';
            addMarker(location, title, address);
        } else {
            const address = `${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`;
            addMarker(location, 'Custom Location', address);
        }
    });
}

// Update coordinates display
function updateCoordinatesDisplay() {
    const center = map.getCenter();
    const coordinatesDisplay = document.getElementById('coordinatesDisplay');
    coordinatesDisplay.textContent = `Lat: ${center.lat().toFixed(6)}, Lng: ${center.lng().toFixed(6)}`;
}

// Show loading state
function showLoadingState(isLoading) {
    const searchBtn = document.getElementById('searchBtn');
    const locationBtn = document.getElementById('getCurrentLocation');
    
    if (isLoading) {
        searchBtn.innerHTML = '<div class="loading"></div>';
        locationBtn.innerHTML = '<div class="loading"></div>';
        searchBtn.disabled = true;
        locationBtn.disabled = true;
    } else {
        searchBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
        locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> My Location';
        searchBtn.disabled = false;
        locationBtn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-size: 0.9rem;
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Load saved locations from localStorage
function loadSavedLocations() {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
        savedLocations = JSON.parse(saved);
        updateSavedLocationsList();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSavedLocations();
    
    // Check if Google Maps API is available
    if (typeof google === 'undefined') {
        showNotification('Google Maps API not loaded. Please check your API key.', 'error');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
});

// Error handling for Google Maps API
window.gm_authFailure = function() {
    showNotification('Google Maps API authentication failed. Please check your API key.', 'error');
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchInput').blur();
    }
});

console.log('Google Maps application script loaded successfully!');