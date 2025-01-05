const dummyRestaurants = []; 

// Function to fetch restaurant data based on a location (lat, lng)
async function fetchRestaurants(location) {
    const apiKey = __CONFIG__.GOOGLE_MAPS_API_KEY;
    const radius = 500; // Search radius in meters (adjust as needed)
    const type = 'restaurant'; // Search for restaurants
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results; // Return the array of restaurant data
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        return []; // Return empty array if there's an error
    }
}

// Subway line colors
const subwayLines = {
    'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
    '1': '#FF3433', '2': '#FF3433', '3': '#FF3433',
    'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A',
    '4': '#00933C', '5': '#00933C', '6': '#00933C',
    'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
    'G': '#6CBE45', 'L': '#A7A9AC', '7': '#B933AD',
    'J': '#996633', 'Z': '#996633'
};

// Create a location input with autocomplete
function createLocationInput(index) {
    const container = document.createElement('div');
    container.className = 'autocomplete-container';
    
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'flex gap-2';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Enter location ${index}`;
    input.className = 'location-input flex-1 p-2 border rounded shadow-sm';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown hidden';
    
    inputWrapper.appendChild(input);
    container.appendChild(inputWrapper);
    container.appendChild(dropdown);
    
    // Initialize Google Places Autocomplete
    const autocomplete = new google.maps.places.Autocomplete(input, {
        bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(40.477399, -74.259090),
            new google.maps.LatLng(40.917577, -73.700272)
        ),
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'geometry', 'name'],
        strictBounds: true,
        types: ['address']
    });
      
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
            // Store the latitude and longitude with the input element
            input.dataset.lat = place.geometry.location.lat();
            input.dataset.lng = place.geometry.location.lng();
        }
    });
        
    return container;
}

// Generate random subway routes
function generateSubwayRoute() {
    const allLines = Object.keys(subwayLines);
    const numLines = Math.floor(Math.random() * 2) + 1; // 1-2 subway lines
    const lines = [];
    for (let i = 0; i < numLines; i++) {
        lines.push(allLines[Math.floor(Math.random() * allLines.length)]);
    }
    return [...new Set(lines)]; // Remove duplicates
}

// Create subway line indicator
function createSubwayIndicator(line) {
    return `<span class="subway-line" style="background-color: ${subwayLines[line]}">${line}</span>`;
}

// Initialize the page with two location inputs
const locationsContainer = document.getElementById('locations-container');
locationsContainer.appendChild(createLocationInput(1));
locationsContainer.appendChild(createLocationInput(2));

// Add Location button handler
document.getElementById('add-location').addEventListener('click', () => {
    const locationCount = document.querySelectorAll('.location-input').length + 1;
    locationsContainer.appendChild(createLocationInput(locationCount));
});

// Create restaurant card with enhanced features
function createRestaurantCard(restaurant, commuteTimes) {
    const totalTime = commuteTimes.reduce((a, b) => a + b.time, 0);
    const card = document.createElement('div');
    card.className = 'location-card bg-white rounded-lg shadow-md overflow-hidden';
    
    const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${restaurant.placeId}`;
    
    card.innerHTML = `
        <div class="p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">
                        <a href="${mapsUrl}" target="_blank" class="hover:text-blue-600 transition">
                            ${restaurant.name}
                            <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                        </a>
                    </h3>
                    <p class="text-gray-600">${restaurant.cuisine}</p>
                </div>
                <span class="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
                    ${restaurant.priceRange}
                </span>
            </div>
            <div class="mb-4">
                <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="ml-1 text-gray-600">${restaurant.rating} (${restaurant.reviews} reviews)</span>
                </div>
                <p class="text-gray-600">${restaurant.address}</p>
            </div>
            <div class="border-t pt-4">
                <h4 class="font-semibold text-gray-800 mb-2">Commute Times:</h4>
                <div class="space-y-2">
                    ${commuteTimes.map((route, i) => `
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Location ${i + 1}</span>
                            <div class="flex items-center">
                                <div class="mr-2">
                                    ${route.subwayLines.map(line => createSubwayIndicator(line)).join('')}
                                </div>
                                <span class="font-medium">${route.time} mins</span>
                            </div>
                        </div>
                    `).join('')}
                    <div class="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
                        <span>Total Commute Time</span>
                        <span>${totalTime} mins</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    return card;
}



// Find Places Handler
document.getElementById('find-places').addEventListener('click', async () => {
    const locations = Array.from(document.querySelectorAll('.location-input')).map(input => input.value);
    
     // Get latitude and longitude for each location
     const locationsWithCoords = locations.map((loc, i) => {
        const input = document.querySelectorAll('.location-input')[i];
            return {
                address: loc,
                lat: parseFloat(input.dataset.lat),
                lng: parseFloat(input.dataset.lng)
            };
        });

    if (locationsWithCoords.some(loc => !loc.lat || !loc.lng)) {
        alert("Please select locations from the autocomplete dropdown to ensure accurate coordinates.");
        return;
    }

    const loadingElement = document.getElementById('loading');
    const resultsContainer = document.getElementById('results');

    loadingElement.classList.remove('hidden');
    resultsContainer.innerHTML = '';

    try {
        const centerLocation = locationsWithCoords[0]; // Use the first location as the center (adjust if needed)

        const restaurants = await fetchRestaurants(centerLocation);
        console.log(restaurants);
        if (!restaurants.length) {
            // Handle cases where no restaurants are found.
            resultsContainer.innerHTML = '<p>No restaurants found near the specified locations.</p>';
            loadingElement.classList.add('hidden');
            return;
        }

        // Calculate commute times using Distance Matrix API
        const commutePromises = restaurants.map(restaurant => calculateCommuteTimes(locationsWithCoords, restaurant));
        const restaurantsWithCommutes = await Promise.all(commutePromises);
        
        // Sort restaurants by total commute time 
        restaurantsWithCommutes.sort((a, b) => a.totalTime - b.totalTime);


        loadingElement.classList.add('hidden');

        restaurantsWithCommutes.forEach(result => {
          if (!result) return; // Skip if calculateCommuteTimes returned null due to an error
          const card = createRestaurantCard(result.restaurant, result.commuteTimes); //Pass dummy commute data to create dummy cards
          resultsContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error processing results:", error);
        resultsContainer.innerHTML = '<p>An error occurred. Please try again.</p>';
    } finally {
        loadingElement.classList.add('hidden');
    }
});


// calculateCommuteTimes
async function calculateCommuteTimes(locations, restaurant) {
    const apiKey = __CONFIG__.GOOGLE_MAPS_API_KEY;
    const origins = locations.map(loc => `${loc.lat},${loc.lng}`);
    const destination = `${restaurant.geometry.location.lat()},${restaurant.geometry.location.lng()}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins.join('|')}&destinations=${destination}&mode=transit&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
          console.error("Distance Matrix API Error:", data.status, data.error_message);
          return null;
        }

        const commuteTimes = data.rows.map(row => {
            const element = row.elements[0];
            if (element.status === 'OK') {
              return {
                 time: Math.round(element.duration.value / 60), // Convert seconds to minutes
                 subwayLines: generateSubwayRoute() // Replace with actual subway lines once integrated with Directions API
              };
            } else {
              console.warn(`Commute time calculation failed for one location: ${element.status}`);
              return { time: -1, subwayLines: [] }; // Return -1 to indicate failure
            }
        });

        const totalTime = commuteTimes.reduce((sum, route) => sum + route.time, 0);

        return {
           restaurant,
           commuteTimes,
           totalTime
        };

    } catch (error) {
        console.error("Error fetching commute times:", error);
        return null;
    }
}
