// Geolocation Service for MedNest Guardian Emergency Dispatch

export interface PatientLocation {
  lat: number;
  lng: number;
  accuracy: number;
  address: string;
  mapsUrl: string;
  isSimulated?: boolean;
}

export async function getPatientLocation(): Promise<PatientLocation> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      resolve({
        lat: 13.0827,
        lng: 80.2707,
        accuracy: 10,
        address: "MedNest Smart Bed Chamber 1, Chennai Home Care",
        mapsUrl: "https://www.google.com/maps?q=13.0827,80.2707",
        isSimulated: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy);

        resolve({
          lat,
          lng,
          accuracy,
          address: `GPS Location (${lat}° N, ${lng}° E, ±${accuracy}m)`,
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          isSimulated: false,
        });
      },
      (error) => {
        console.warn("[Geolocation] Could not acquire GPS coordinates:", error.message);
        // Reliable fallback location
        resolve({
          lat: 13.0827,
          lng: 80.2707,
          accuracy: 15,
          address: "MedNest Smart Bed Chamber 1, Chennai Home Care",
          mapsUrl: "https://www.google.com/maps?q=13.0827,80.2707",
          isSimulated: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 10000,
      }
    );
  });
}
