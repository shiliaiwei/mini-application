import { NextResponse } from "next/server";

interface GeocodeResponse {
  success: boolean;
  source: "gps" | "ip_network" | "fallback";
  coordinates: {
    lat: number;
    lng: number;
  };
  address: {
    street: string;
    unit?: string;
    city: string;
    stateProvince?: string;
    postalCode?: string;
    country: string;
    displayName: string;
  };
  error?: string;
}

const FALLBACK_ADDRESS = {
  street: "Preah Norodom Blvd",
  unit: "Delivery Point",
  city: "Phnom Penh",
  stateProvince: "Khan Daun Penh",
  postalCode: "120211",
  country: "Cambodia",
  displayName: "Preah Norodom Blvd, Sangkat Phsar Thmei 3, Khan Daun Penh, Phnom Penh, Cambodia",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    let lat = latParam ? parseFloat(latParam) : null;
    let lng = lngParam ? parseFloat(lngParam) : null;
    let source: "gps" | "ip_network" | "fallback" = "gps";

    // 1. If GPS coordinates were not provided, locate via client IP
    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      source = "ip_network";
      const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "";
      const clientIp = forwarded.split(",")[0].trim().replace(/[^a-fA-F0-9.:]/g, "");

      // For localhost / private IPs, default to Cambodia Phnom Penh center
      const isPrivate =
        !clientIp ||
        clientIp === "::1" ||
        clientIp === "127.0.0.1" ||
        clientIp.startsWith("192.168.") ||
        clientIp.startsWith("10.");

      if (!isPrivate) {
        try {
          const ipRes = await fetch(
            `http://ip-api.com/json/${clientIp}?fields=status,country,regionName,city,zip,lat,lon`,
            { signal: AbortSignal.timeout(3000) }
          );
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.status === "success" && typeof ipData.lat === "number") {
              lat = ipData.lat;
              lng = ipData.lon;
            }
          }
        } catch {
          // Fall through to default coordinates
        }
      }

      // If IP geolocation could not resolve, use Phnom Penh delivery hub
      if (lat === null || lng === null) {
        lat = 11.5564;
        lng = 104.9282;
        source = "fallback";
      }
    }

    // 2. Reverse geocode coordinates to real physical address via OpenStreetMap Nominatim
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=en,km`;
      const geoRes = await fetch(geoUrl, {
        headers: {
          "User-Agent": "SHILIAIWEI-MiniApp-DeliveryRouter/1.0 (contact: admin@kesararamwithdigital.tech)",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (geoRes.ok) {
        const data = await geoRes.json();
        const addr = data.address || {};

        const street =
          addr.road ||
          addr.pedestrian ||
          addr.residential ||
          addr.suburb ||
          addr.hamlet ||
          FALLBACK_ADDRESS.street;

        const city =
          addr.city ||
          addr.town ||
          addr.county ||
          addr.state ||
          FALLBACK_ADDRESS.city;

        const stateProvince =
          addr.city_district ||
          addr.suburb ||
          addr.district ||
          addr.state ||
          FALLBACK_ADDRESS.stateProvince;

        const postalCode = addr.postcode || FALLBACK_ADDRESS.postalCode;
        const country = addr.country || FALLBACK_ADDRESS.country;
        const displayName = data.display_name || `${street}, ${city}, ${country}`;

        const payload: GeocodeResponse = {
          success: true,
          source,
          coordinates: { lat, lng },
          address: {
            street,
            unit: addr.house_number ? `No. ${addr.house_number}` : "",
            city,
            stateProvince,
            postalCode,
            country,
            displayName,
          },
        };

        return NextResponse.json(payload);
      }
    } catch {
      // Fall through to fallback
    }

    // 3. Resilient Fallback Real Address
    const payload: GeocodeResponse = {
      success: true,
      source: "fallback",
      coordinates: { lat, lng },
      address: {
        ...FALLBACK_ADDRESS,
      },
    };

    return NextResponse.json(payload);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "fallback",
        coordinates: { lat: 11.5564, lng: 104.9282 },
        address: FALLBACK_ADDRESS,
        error: err instanceof Error ? err.message : "Geocoding service unavailable",
      },
      { status: 500 }
    );
  }
}
