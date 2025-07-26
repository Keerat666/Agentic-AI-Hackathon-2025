import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, ShoppingBag, Gift, Coffee, Car, Home } from "lucide-react";

const recentTransactions = [
  {
    id: 1,
    vendor: "Whole Foods Market",
    date: "Today, 2:30 PM",
    amount: "$42.68",
    category: "Groceries",
    icon: ShoppingBag,
    color: "bg-chart-mint",
    paymentMethod: "••••1234"
  },
  {
    id: 2,
    vendor: "Starbucks Coffee",
    date: "Today, 8:45 AM",
    amount: "$5.75",
    category: "Coffee & Dining",
    icon: Coffee,
    color: "bg-chart-pink",
    paymentMethod: "••••1234"
  },
  {
    id: 3,
    vendor: "Amazon Purchase",
    date: "Yesterday, 6:20 PM",
    amount: "$28.99",
    category: "Online Shopping",
    icon: Gift,
    color: "bg-chart-lavender",
    paymentMethod: "••••5678"
  }
];

export default function UploadTab() {
  return (
    <div className="pt-20 pb-24 px-6 space-y-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Upload buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex-col gap-2 shadow-md">
            <Camera className="h-6 w-6" />
            <span className="text-sm font-medium">Take Photo</span>
          </Button>
          <Button variant="outline" className="h-16 border-2 border-primary/20 hover:bg-primary/5 rounded-2xl flex-col gap-2">
            <Upload className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Import Gallery</span>
          </Button>
        </div>

        {/* Recent transactions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          
          {recentTransactions.map((transaction) => {
            const Icon = transaction.icon;
            return (
              <Card key={transaction.id} className="p-4 border-0 shadow-sm bg-card rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${transaction.color} rounded-2xl flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{transaction.vendor}</h3>
                      <span className="font-bold text-lg">{transaction.amount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{transaction.category}</span>
                      <span>{transaction.paymentMethod}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{transaction.date}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}