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
    const { origin, destination } = await req.json();
    
    if (!origin || !destination) {
      throw new Error("Origin and destination are required");
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is not configured");
    }

    // Origin and destination can be lat,lng or address string
    const originParam = typeof origin === "object" 
      ? `${origin.lat},${origin.lng}` 
      : origin;
    const destParam = typeof destination === "object" 
      ? `${destination.lat},${destination.lng}` 
      : destination;

    console.log(`[ROUTE] Calculating route from ${originParam} to ${destParam}`);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(originParam)}&destination=${encodeURIComponent(destParam)}&key=${apiKey}&language=pt-BR&mode=driving`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      console.error(`[ROUTE] Google API error: ${data.status}`);
      throw new Error(`Directions failed: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    const result = {
      distance: {
        text: leg.distance.text,
        value: leg.distance.value, // meters
      },
      duration: {
        text: leg.duration.text,
        value: leg.duration.value, // seconds
      },
      eta_minutes: Math.round(leg.duration.value / 60),
      start_address: leg.start_address,
      end_address: leg.end_address,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text,
      })),
    };

    console.log(`[ROUTE] Route calculated: ${result.distance.text}, ${result.duration.text}`);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ROUTE] Error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
