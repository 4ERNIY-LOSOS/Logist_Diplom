import axios from 'axios';

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

export const geocodingService = {
  async search(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'AXIS-Logistics-App',
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          display_name: result.display_name,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  async geocodeAddress(addr: { country: string; city: string; street: string; houseNumber: string }): Promise<{ lat: number; lon: number } | null> {
    const query = `${addr.houseNumber} ${addr.street}, ${addr.city}, ${addr.country}`;
    return this.search(query);
  }
};
