/**
 * Mock MCP Tools for Travel Agent Demo
 * Simulates realistic travel service responses with async delays
 */

import { v4 as uuidv4 } from 'uuid';

// Simulate network delay (400-1000ms)
const simulateDelay = () => new Promise(resolve =>
  setTimeout(resolve, 400 + Math.random() * 600)
);

// Airlines data
const AIRLINES = ['Emirates', 'Singapore Airlines', 'Qatar Airways', 'Lufthansa', 'British Airways', 'Delta', 'United', 'JAL', 'ANA', 'Air France'];
const HOTEL_CHAINS = ['The Ritz-Carlton', 'Four Seasons', 'Mandarin Oriental', 'St. Regis', 'Park Hyatt', 'Waldorf Astoria', 'Aman', 'Belmond', 'Rosewood', 'Peninsula'];

/**
 * Generate random flight number
 */
function generateFlightNumber(airline) {
  const codes = { 'Emirates': 'EK', 'Singapore Airlines': 'SQ', 'Qatar Airways': 'QR', 'Lufthansa': 'LH', 'British Airways': 'BA', 'Delta': 'DL', 'United': 'UA', 'JAL': 'JL', 'ANA': 'NH', 'Air France': 'AF' };
  return `${codes[airline] || 'XX'}${Math.floor(100 + Math.random() * 900)}`;
}

/**
 * Generate random time in HH:MM format
 */
function generateTime() {
  const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
  return `${hours}:${minutes}`;
}

/**
 * Tool: search_flights
 * Search for available flights
 */
export async function search_flights({ origin, destination, date, passengers = 1, cabin_class = 'economy' }) {
  await simulateDelay();

  const basePrice = cabin_class === 'business' ? 2500 : cabin_class === 'first' ? 8000 : 450;
  const flights = [];

  for (let i = 0; i < 3; i++) {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const departTime = generateTime();
    const durationHours = 2 + Math.floor(Math.random() * 14);
    const stops = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0;

    flights.push({
      flight_id: `FL-${uuidv4().substring(0, 8).toUpperCase()}`,
      airline,
      flight_number: generateFlightNumber(airline),
      origin,
      destination,
      date,
      departure_time: departTime,
      arrival_time: `${(parseInt(departTime.split(':')[0]) + durationHours) % 24}:${departTime.split(':')[1]}`.padStart(5, '0'),
      duration: `${durationHours}h ${Math.floor(Math.random() * 60)}m`,
      stops: stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`,
      cabin_class: cabin_class.charAt(0).toUpperCase() + cabin_class.slice(1),
      price: Math.floor(basePrice + Math.random() * basePrice * 0.5) * passengers,
      currency: 'USD',
      seats_left: Math.floor(2 + Math.random() * 8),
      amenities: cabin_class === 'economy' ? ['Wi-Fi', 'Entertainment'] : ['Lie-flat seat', 'Lounge access', 'Priority boarding', 'Wi-Fi', 'Gourmet dining'],
    });
  }

  return {
    success: true,
    search_id: `SRCH-${uuidv4().substring(0, 8).toUpperCase()}`,
    route: `${origin} → ${destination}`,
    date,
    passengers,
    cabin_class,
    results_count: flights.length,
    flights: flights.sort((a, b) => a.price - b.price),
  };
}

/**
 * Tool: search_hotels
 * Search for available hotels
 */
export async function search_hotels({ city, check_in, check_out, guests = 2, star_rating = 4 }) {
  await simulateDelay();

  const nights = Math.max(1, Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24)));
  const hotels = [];

  for (let i = 0; i < 3; i++) {
    const chain = HOTEL_CHAINS[Math.floor(Math.random() * HOTEL_CHAINS.length)];
    const stars = Math.max(star_rating, Math.min(5, star_rating + Math.floor(Math.random() * 2)));
    const pricePerNight = 150 + stars * 80 + Math.floor(Math.random() * 200);

    hotels.push({
      hotel_id: `HTL-${uuidv4().substring(0, 8).toUpperCase()}`,
      name: `${chain} ${city}`,
      chain,
      stars,
      location: `${['Downtown', 'City Center', 'Waterfront', 'Historic District', 'Business District'][Math.floor(Math.random() * 5)]}, ${city}`,
      check_in,
      check_out,
      nights,
      price_per_night: pricePerNight,
      total_price: pricePerNight * nights,
      currency: 'USD',
      rating: (4.2 + Math.random() * 0.7).toFixed(1),
      reviews_count: Math.floor(500 + Math.random() * 2000),
      amenities: ['Free Wi-Fi', 'Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge'],
      room_type: guests > 2 ? 'Suite' : 'Deluxe Room',
      cancellation: 'Free cancellation until 24h before check-in',
    });
  }

  return {
    success: true,
    search_id: `SRCH-${uuidv4().substring(0, 8).toUpperCase()}`,
    city,
    check_in,
    check_out,
    guests,
    nights,
    results_count: hotels.length,
    hotels: hotels.sort((a, b) => a.total_price - b.total_price),
  };
}

/**
 * Tool: get_weather_forecast
 * Get weather forecast for a destination
 */
export async function get_weather_forecast({ city, start_date, end_date }) {
  await simulateDelay();

  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  const forecast = [];
  const startDt = new Date(start_date);
  const endDt = new Date(end_date);
  const days = Math.min(7, Math.ceil((endDt - startDt) / (1000 * 60 * 60 * 24)) + 1);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDt);
    date.setDate(date.getDate() + i);
    const tempHigh = 68 + Math.floor(Math.random() * 25);

    forecast.push({
      date: date.toISOString().split('T')[0],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temp_high_f: tempHigh,
      temp_low_f: tempHigh - 10 - Math.floor(Math.random() * 10),
      temp_high_c: Math.round((tempHigh - 32) * 5 / 9),
      temp_low_c: Math.round((tempHigh - 15 - 32) * 5 / 9),
      humidity: 40 + Math.floor(Math.random() * 40),
      uv_index: Math.floor(3 + Math.random() * 7),
      precipitation_chance: Math.floor(Math.random() * 40),
    });
  }

  const avgTemp = Math.round(forecast.reduce((sum, f) => sum + f.temp_high_f, 0) / forecast.length);

  return {
    success: true,
    city,
    period: `${start_date} to ${end_date}`,
    forecast,
    packing_recommendation: avgTemp > 75
      ? 'Pack light, breathable clothing. Sunscreen and sunglasses essential. Consider a hat for sun protection.'
      : avgTemp > 60
      ? 'Pack layers for variable temperatures. Light jacket recommended for evenings.'
      : 'Pack warm layers and a good jacket. Consider waterproof footwear.',
    best_activities: avgTemp > 75
      ? ['Beach', 'Water sports', 'Outdoor dining']
      : ['Museums', 'City tours', 'Local cuisine'],
  };
}

/**
 * Tool: search_activities
 * Search for activities and experiences
 */
export async function search_activities({ city, date, category = 'culture', budget = 200 }) {
  await simulateDelay();

  const activityTypes = {
    culture: ['Museum Tour', 'Historical Walking Tour', 'Art Gallery Visit', 'Architecture Tour', 'Local Market Experience'],
    adventure: ['Helicopter Tour', 'Zip-lining Experience', 'Scuba Diving', 'Mountain Hiking', 'Paragliding'],
    food: ['Food Tour', 'Cooking Class', 'Wine Tasting', 'Michelin Star Dining', 'Street Food Adventure'],
    nature: ['National Park Tour', 'Wildlife Safari', 'Botanical Garden Visit', 'Sunset Cruise', 'Nature Photography Tour'],
  };

  const activities = [];
  const types = activityTypes[category] || activityTypes.culture;

  for (let i = 0; i < 3; i++) {
    const activity = types[Math.floor(Math.random() * types.length)];
    const price = Math.floor(30 + Math.random() * Math.min(budget, 250));

    activities.push({
      activity_id: `ACT-${uuidv4().substring(0, 8).toUpperCase()}`,
      name: `${activity} in ${city}`,
      category,
      date,
      duration: `${2 + Math.floor(Math.random() * 4)} hours`,
      price,
      currency: 'USD',
      rating: (4.3 + Math.random() * 0.6).toFixed(1),
      reviews_count: Math.floor(100 + Math.random() * 500),
      highlights: [
        'Expert local guide',
        'Small group (max 12)',
        'Hotel pickup included',
        category === 'food' ? 'Tastings included' : 'Skip-the-line access',
      ],
      meeting_point: `${city} City Center`,
      languages: ['English', 'Spanish', 'French'],
      cancellation: 'Free cancellation up to 24h before',
    });
  }

  return {
    success: true,
    search_id: `SRCH-${uuidv4().substring(0, 8).toUpperCase()}`,
    city,
    date,
    category,
    results_count: activities.length,
    activities: activities.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)),
  };
}

/**
 * Tool: create_itinerary
 * Create a complete travel itinerary
 */
export async function create_itinerary({ traveler_name, destination, flight_ids = [], hotel_ids = [], activity_ids = [] }) {
  await simulateDelay();

  const itineraryId = `ITN-${uuidv4().substring(0, 6).toUpperCase()}`;
  const pnr = uuidv4().substring(0, 6).toUpperCase();
  const totalCost = 2500 + Math.floor(Math.random() * 3000);

  return {
    success: true,
    itinerary_id: itineraryId,
    pnr,
    traveler_name,
    destination,
    status: 'CONFIRMED',
    created_at: new Date().toISOString(),
    components: {
      flights: flight_ids.length,
      hotels: hotel_ids.length,
      activities: activity_ids.length,
    },
    total_cost: totalCost,
    currency: 'USD',
    payment_status: 'PENDING',
    confirmation_email: 'Sent to registered email',
    next_steps: [
      'Complete payment within 24 hours',
      'Download your travel documents',
      'Check visa requirements',
      'Add travel insurance (recommended)',
    ],
    support: {
      phone: '+1-800-VOYAGER',
      email: 'support@voyager-ai.com',
      live_chat: 'Available 24/7',
    },
  };
}

/**
 * Tool: get_visa_requirements
 * Get visa requirements for a destination
 */
export async function get_visa_requirements({ destination_country, passport_country }) {
  await simulateDelay();

  // Simplified visa database
  const visaFree = {
    'US': ['Canada', 'UK', 'France', 'Germany', 'Japan', 'South Korea', 'Italy', 'Spain', 'Australia', 'Singapore'],
    'UK': ['US', 'Canada', 'France', 'Germany', 'Japan', 'Italy', 'Spain', 'Australia', 'Singapore', 'UAE'],
  };

  const isVisaFree = visaFree[passport_country]?.includes(destination_country);

  if (isVisaFree) {
    return {
      success: true,
      destination_country,
      passport_country,
      visa_required: false,
      visa_type: 'Visa-free entry',
      max_stay: '90 days',
      processing_time: 'N/A',
      fee: 0,
      currency: 'USD',
      required_documents: [
        'Valid passport (6+ months validity)',
        'Return/onward ticket',
        'Proof of accommodation',
        'Proof of sufficient funds',
      ],
      notes: `${passport_country} passport holders can enter ${destination_country} visa-free for tourism purposes.`,
      entry_requirements: [
        'Complete arrival card',
        'May need to show proof of funds',
        'COVID-19 requirements may apply - check latest updates',
      ],
    };
  } else {
    return {
      success: true,
      destination_country,
      passport_country,
      visa_required: true,
      visa_type: 'Tourist Visa / eVisa',
      max_stay: '30-90 days',
      processing_time: '3-15 business days',
      fee: 40 + Math.floor(Math.random() * 120),
      currency: 'USD',
      required_documents: [
        'Valid passport (6+ months validity)',
        'Completed visa application form',
        'Passport-sized photos (2)',
        'Proof of accommodation',
        'Return ticket',
        'Bank statements (last 3 months)',
        'Travel insurance',
      ],
      notes: `Apply online or at the ${destination_country} embassy/consulate. eVisa available for most nationalities.`,
      application_links: [
        `https://visa.${destination_country.toLowerCase()}.gov/apply`,
      ],
    };
  }
}

/**
 * Tool: currency_exchange
 * Get currency exchange rates
 */
export async function currency_exchange({ from_currency, to_currency, amount }) {
  await simulateDelay();

  // Simplified exchange rates (vs USD baseline)
  const rates = {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 149.50,
    'AED': 3.67,
    'SGD': 1.34,
    'AUD': 1.53,
    'CAD': 1.36,
    'CHF': 0.88,
    'INR': 83.12,
    'THB': 35.50,
  };

  const fromRate = rates[from_currency] || 1;
  const toRate = rates[to_currency] || 1;
  const rate = toRate / fromRate;
  const convertedAmount = (amount * rate).toFixed(2);

  return {
    success: true,
    from_currency,
    to_currency,
    amount,
    rate: rate.toFixed(4),
    converted_amount: parseFloat(convertedAmount),
    last_updated: new Date().toISOString(),
    provider: 'Voyager Exchange',
    fee: '0% commission',
    money_saving_tip: amount > 1000
      ? `For amounts over $1000, consider using a travel debit card for better rates. Avoid airport currency exchanges.`
      : `Use your credit card for purchases abroad - most offer competitive exchange rates with no foreign transaction fees.`,
    rate_trend: Math.random() > 0.5 ? 'Rate has improved 1.2% this week' : 'Rate is stable this week',
  };
}

// Tool registry with schemas (for MCP protocol)
export const toolRegistry = [
  {
    name: 'search_flights',
    description: 'Search for available flights between two cities. Returns flight options with prices, times, and availability.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Origin airport code or city (e.g., "NYC", "JFK", "New York")' },
        destination: { type: 'string', description: 'Destination airport code or city (e.g., "DXB", "Dubai")' },
        date: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
        passengers: { type: 'number', description: 'Number of passengers (default: 1)' },
        cabin_class: { type: 'string', enum: ['economy', 'business', 'first'], description: 'Cabin class preference' },
      },
      required: ['origin', 'destination', 'date'],
    },
    handler: search_flights,
    usageCount: 0,
  },
  {
    name: 'search_hotels',
    description: 'Search for available hotels in a city. Returns hotel options with prices, ratings, and amenities.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name to search hotels in' },
        check_in: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
        check_out: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
        guests: { type: 'number', description: 'Number of guests (default: 2)' },
        star_rating: { type: 'number', description: 'Minimum star rating (1-5)' },
      },
      required: ['city', 'check_in', 'check_out'],
    },
    handler: search_hotels,
    usageCount: 0,
  },
  {
    name: 'get_weather_forecast',
    description: 'Get weather forecast for a destination city. Helps plan activities and packing.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name for weather forecast' },
        start_date: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
        end_date: { type: 'string', description: 'End date in YYYY-MM-DD format' },
      },
      required: ['city', 'start_date', 'end_date'],
    },
    handler: get_weather_forecast,
    usageCount: 0,
  },
  {
    name: 'search_activities',
    description: 'Search for activities and experiences in a destination. Categories: culture, adventure, food, nature.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City to search activities in' },
        date: { type: 'string', description: 'Date for the activity in YYYY-MM-DD format' },
        category: { type: 'string', enum: ['culture', 'adventure', 'food', 'nature'], description: 'Activity category' },
        budget: { type: 'number', description: 'Maximum budget per person in USD' },
      },
      required: ['city', 'date'],
    },
    handler: search_activities,
    usageCount: 0,
  },
  {
    name: 'create_itinerary',
    description: 'Create a complete travel itinerary with flights, hotels, and activities. Returns booking confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        traveler_name: { type: 'string', description: 'Name of the primary traveler' },
        destination: { type: 'string', description: 'Trip destination' },
        flight_ids: { type: 'array', items: { type: 'string' }, description: 'Array of selected flight IDs' },
        hotel_ids: { type: 'array', items: { type: 'string' }, description: 'Array of selected hotel IDs' },
        activity_ids: { type: 'array', items: { type: 'string' }, description: 'Array of selected activity IDs' },
      },
      required: ['traveler_name', 'destination'],
    },
    handler: create_itinerary,
    usageCount: 0,
  },
  {
    name: 'get_visa_requirements',
    description: 'Get visa requirements for traveling to a country. Includes required documents and processing info.',
    inputSchema: {
      type: 'object',
      properties: {
        destination_country: { type: 'string', description: 'Country you are traveling to' },
        passport_country: { type: 'string', description: 'Country that issued your passport (e.g., "US", "UK")' },
      },
      required: ['destination_country', 'passport_country'],
    },
    handler: get_visa_requirements,
    usageCount: 0,
  },
  {
    name: 'currency_exchange',
    description: 'Get currency exchange rates and convert amounts. Includes money-saving tips.',
    inputSchema: {
      type: 'object',
      properties: {
        from_currency: { type: 'string', description: 'Source currency code (e.g., "USD")' },
        to_currency: { type: 'string', description: 'Target currency code (e.g., "EUR")' },
        amount: { type: 'number', description: 'Amount to convert' },
      },
      required: ['from_currency', 'to_currency', 'amount'],
    },
    handler: currency_exchange,
    usageCount: 0,
  },
];

// Export tool executor
export async function executeTool(toolName, args) {
  const tool = toolRegistry.find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  tool.usageCount++;
  return await tool.handler(args);
}

// Get tool by name
export function getTool(name) {
  return toolRegistry.find(t => t.name === name);
}

// Get all tools for Ollama format
export function getToolsForOllama() {
  return toolRegistry.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}
