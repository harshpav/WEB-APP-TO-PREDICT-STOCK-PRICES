import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";

interface FuturePredictionProps {
  predictions: number[];
}

export const FuturePrediction = ({ predictions }: FuturePredictionProps) => {
  const chartData = predictions.map((price, index) => ({
    day: index + 1,
    price: price,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>30-Day Price Forecast</CardTitle>
            <CardDescription>Predicted stock prices for the next 30 days</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="day" 
              className="text-xs"
              label={{ value: 'Days Ahead', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              className="text-xs"
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => ['$' + value.toFixed(2), 'Predicted Price']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              name="Predicted Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
