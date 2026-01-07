import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate JWT token from the request
async function validateAuth(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    console.error("No authorization header");
    return false;
  }

  const token = authHeader.replace("Bearer ", "");
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error("Invalid token:", error?.message);
    return false;
  }

  console.log(`Authenticated user: ${user.id}`);
  return true;
}

// Validate coordinate object
function validateCoordinate(coord: unknown): { lat: number; lng: number } | null {
  if (typeof coord !== 'object' || coord === null) {
    return null;
  }
  
  const obj = coord as Record<string, unknown>;
  const lat = obj.lat;
  const lng = obj.lng;
  
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }
  
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  
  if (lat < -90 || lat > 90) {
    return null;
  }
  
  if (lng < -180 || lng > 180) {
    return null;
  }
  
  return { lat, lng };
}

// Validate address string
function validateAddressString(address: unknown): string | null {
  if (typeof address !== 'string') {
    return null;
  }
  
  const trimmed = address.trim();
  
  // Minimum length check
  if (trimmed.length < 3) {
    return null;
  }
  
  // Maximum length check (prevent abuse)
  if (trimmed.length > 500) {
    return null;
  }
  
  return trimmed;
}

// Validate origin/destination which can be either coordinate object or address string
function validateLocation(location: unknown): string | null {
  if (!location) {
    return null;
  }
  
  // Try as coordinate object
  if (typeof location === 'object') {
    const coord = validateCoordinate(location);
    if (coord) {
      return `${coord.lat},${coord.lng}`;
    }
    return null;
  }
  
  // Try as address string
  return validateAddressString(location);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authentication
  const isAuthenticated = await validateAuth(req);
  if (!isAuthenticated) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401 
      }
    );
  }

  try {
    const body = await req.json();
    const { origin, destination } = body;
    
    // Validate origin
    const validOrigin = validateLocation(origin);
    if (!validOrigin) {
      return new Response(
        JSON.stringify({ error: "Invalid origin. Must be a valid address string (3-500 chars) or coordinate object with lat (-90 to 90) and lng (-180 to 180)." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Validate destination
    const validDestination = validateLocation(destination);
    if (!validDestination) {
      return new Response(
        JSON.stringify({ error: "Invalid destination. Must be a valid address string (3-500 chars) or coordinate object with lat (-90 to 90) and lng (-180 to 180)." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is not configured");
    }

    console.log(`[ROUTE] Calculating route from ${validOrigin} to ${validDestination}`);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(validOrigin)}&destination=${encodeURIComponent(validDestination)}&key=${apiKey}&language=pt-BR&mode=driving`
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
      steps: leg.steps.map((step: { html_instructions: string; distance: { text: string }; duration: { text: string } }) => ({
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
