import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
      throw new Error("Latitude and longitude are required");
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is not configured");
    }

    console.log(`[GEOCODE] Fetching address for: ${latitude}, ${longitude}`);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=pt-BR`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      console.error(`[GEOCODE] Google API error: ${data.status}`);
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    const address = result.formatted_address;
    
    // Extract city and state from address components
    let city = "";
    let state = "";
    for (const component of result.address_components) {
      if (component.types.includes("administrative_area_level_2")) {
        city = component.long_name;
      }
      if (component.types.includes("administrative_area_level_1")) {
        state = component.short_name;
      }
    }

    console.log(`[GEOCODE] Address found: ${address}`);

    return new Response(
      JSON.stringify({ 
        address, 
        city, 
        state,
        formatted: `${address}`,
        place_id: result.place_id
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[GEOCODE] Error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
