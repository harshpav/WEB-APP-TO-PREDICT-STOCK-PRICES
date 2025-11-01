import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    console.log('Fetching stock data for symbol:', symbol);

    // Since we can't run Python directly, we'll use the Lovable AI to simulate predictions
    // In a real deployment, you would call your Python backend here
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate simulated stock data based on the symbol
    // This is a placeholder - in production, this would call your actual ML model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are a stock market data generator. Generate realistic stock prediction data for the given symbol.
            Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
            {
              "symbol": "SYMBOL",
              "historicalData": [{"date": "2024-01-01", "price": 150.5}, ...] (20 data points),
              "predictions": [{"index": 1, "actual": 150.5, "predicted": 151.2}, ...] (20 data points),
              "metrics": {"rmse": 2.5, "mae": 1.8, "r2": 0.95},
              "futurePredictions": [155.5, 156.2, ...] (30 numbers representing future prices)
            }` 
          },
          { 
            role: "user", 
            content: `Generate stock prediction data for ${symbol}. Make the prices realistic for this stock. Return only the JSON object, no other text.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    console.log('AI response received');
    
    let content = aiData.choices?.[0]?.message?.content;
    
    // Clean up the response - remove markdown code blocks if present
    if (content) {
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      content = content.trim();
    }
    
    const stockData = JSON.parse(content);

    return new Response(
      JSON.stringify(stockData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in stock-prediction function:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate stock prediction";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
