import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface StockInputProps {
  onSubmit: (symbol: string) => void;
  loading: boolean;
}

export const StockInput = ({ onSubmit, loading }: StockInputProps) => {
  const [symbol, setSymbol] = useState("GOOG");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSubmit(symbol.toUpperCase());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Stock Symbol</CardTitle>
        <CardDescription>
          Enter a stock ticker symbol to analyze and predict future prices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g., GOOG, AAPL, TSLA"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              "Loading..."
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
