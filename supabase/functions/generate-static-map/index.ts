import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Validate address string
function validateAddress(address: unknown): string | null {
  if (typeof address !== 'string') {
    return null;
  }
  
  const trimmed = address.trim();
  
  // Minimum length check
  if (trimmed.length < 3) {
    return null;
  }
  
  // Maximum length check (prevent abuse)
  if (trimmed.length > 300) {
    return null;
  }
  
  return trimmed;
}

// Validate and constrain dimension values
function validateDimension(value: unknown, defaultValue: number, min: number, max: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(Math.max(Math.floor(value), min), max);
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return Math.min(Math.max(parsed, min), max);
    }
  }
  
  return defaultValue;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authentication
  const isAuthenticated = await validateAuth(req);
  if (!isAuthenticated) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401 
      }
    );
  }

  try {
    const body = await req.json();
    const { originAddress, destinationAddress, width: rawWidth, height: rawHeight } = body;

    // Validate addresses
    const validOrigin = validateAddress(originAddress);
    const validDestination = validateAddress(destinationAddress);
    
    if (!validOrigin || !validDestination) {
      return new Response(
        JSON.stringify({ error: 'Invalid addresses. Both origin and destination must be non-empty strings (3-300 characters).' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate and constrain dimensions (min 100, max 1200)
    const width = validateDimension(rawWidth, 600, 100, 1200);
    const height = validateDimension(rawHeight, 300, 100, 1200);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating static map:', { originAddress: validOrigin, destinationAddress: validDestination, width, height });

    // Encode addresses for URL
    const origin = encodeURIComponent(validOrigin);
    const destination = encodeURIComponent(validDestination);

    // Build Google Maps Static API URL with route
    // Using Directions API to get the actual path, then embedding in Static Maps
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;
    
    const directionsResponse = await fetch(directionsUrl);
    const directionsData = await directionsResponse.json();

    let mapUrl: string;

    if (directionsData.status === 'OK' && directionsData.routes?.[0]?.overview_polyline?.points) {
      // Use the encoded polyline from Directions API
      const polyline = encodeURIComponent(directionsData.routes[0].overview_polyline.points);
      
      mapUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
        `size=${width}x${height}&` +
        `maptype=roadmap&` +
        `path=enc:${polyline}&` +
        `path=color:0x4CAF50|weight:4|enc:${polyline}&` +
        `markers=color:green|label:A|${origin}&` +
        `markers=color:red|label:B|${destination}&` +
        `style=feature:poi|visibility:off&` +
        `key=${apiKey}`;
    } else {
      console.warn('Could not get directions, falling back to simple map:', directionsData.status);
      
      // Fallback: simple map with markers only
      mapUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
        `size=${width}x${height}&` +
        `maptype=roadmap&` +
        `markers=color:green|label:A|${origin}&` +
        `markers=color:red|label:B|${destination}&` +
        `style=feature:poi|visibility:off&` +
        `key=${apiKey}`;
    }

    console.log('Generated map URL successfully');

    return new Response(
      JSON.stringify({ 
        mapUrl,
        status: directionsData.status === 'OK' ? 'route_found' : 'markers_only'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error generating static map:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate map';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
