import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originAddress, destinationAddress, width = 600, height = 300 } = await req.json();

    if (!originAddress || !destinationAddress) {
      console.error('Missing required parameters:', { originAddress, destinationAddress });
      return new Response(
        JSON.stringify({ error: 'Origin and destination addresses are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    console.log('Generating static map:', { originAddress, destinationAddress, width, height });

    // Encode addresses for URL
    const origin = encodeURIComponent(originAddress);
    const destination = encodeURIComponent(destinationAddress);

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
