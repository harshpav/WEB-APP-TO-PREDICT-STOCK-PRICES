import { TrendingUp } from "lucide-react";

export const StockHeader = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Market Predictor</h1>
            <p className="text-muted-foreground">AI-powered stock analysis and forecasting</p>
          </div>
        </div>
      </div>
    </header>
  );
};
