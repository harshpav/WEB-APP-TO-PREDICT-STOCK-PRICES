import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingDown, Award } from "lucide-react";

interface StockMetricsProps {
  metrics: {
    rmse: number;
    mae: number;
    r2: number;
  };
}

export const StockMetrics = ({ metrics }: StockMetricsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Performance Metrics</CardTitle>
        <CardDescription>Evaluation of prediction accuracy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RMSE</p>
              <p className="text-2xl font-bold">{metrics.rmse.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingDown className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">MAE</p>
              <p className="text-2xl font-bold">{metrics.mae.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
            <div className="p-2 bg-chart-3/10 rounded-lg">
              <Award className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">R² Score</p>
              <p className="text-2xl font-bold">{metrics.r2.toFixed(4)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
