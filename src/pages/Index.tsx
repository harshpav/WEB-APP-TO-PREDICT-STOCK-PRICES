import { useState } from "react";
import { StockHeader } from "@/components/StockHeader";
import { StockInput } from "@/components/StockInput";
import { StockCharts } from "@/components/StockCharts";
import { StockMetrics } from "@/components/StockMetrics";
import { FuturePrediction } from "@/components/FuturePrediction";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StockData {
  symbol: string;
  historicalData: any;
  predictions: any;
  metrics: {
    rmse: number;
    mae: number;
    r2: number;
  };
  futurePredictions: number[];
}

const Index = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStockSubmit = async (symbol: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-prediction', {
        body: { symbol }
      });

      if (error) throw error;

      setStockData(data);
      toast({
        title: "Success",
        description: `Stock data loaded for ${symbol}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch stock data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StockHeader />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <StockInput onSubmit={handleStockSubmit} loading={loading} />
        
        {stockData && (
          <>
            <StockCharts 
              symbol={stockData.symbol}
              historicalData={stockData.historicalData}
              predictions={stockData.predictions}
            />
            <StockMetrics metrics={stockData.metrics} />
            <FuturePrediction predictions={stockData.futurePredictions} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
