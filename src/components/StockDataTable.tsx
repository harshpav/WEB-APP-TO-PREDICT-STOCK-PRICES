import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";

interface StockDataTableProps {
  symbol: string;
  historicalData: Array<{ 
    date: string; 
    open: number; 
    high: number; 
    low: number; 
    close: number; 
    volume: number;
  }>;
}

export const StockDataTable = ({ symbol, historicalData }: StockDataTableProps) => {
  const downloadCSV = () => {
    const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
    const csvContent = [
      headers.join(','),
      ...historicalData.map(row => `${row.date},${row.open},${row.high},${row.low},${row.close},${row.volume}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${symbol}_stock_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stock Data</CardTitle>
            <CardDescription>Historical stock prices for {symbol}</CardDescription>
          </div>
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Open</TableHead>
                <TableHead className="text-right">High</TableHead>
                <TableHead className="text-right">Low</TableHead>
                <TableHead className="text-right">Close</TableHead>
                <TableHead className="text-right">Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicalData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.date}</TableCell>
                  <TableCell className="text-right">${row.open.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${row.high.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${row.low.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${row.close.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{row.volume.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
