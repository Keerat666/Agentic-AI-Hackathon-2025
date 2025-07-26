import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const weeklyData = [
  { day: 'Mon', amount: 45, color: '#86EFAC' },
  { day: 'Tue', amount: 78, color: '#F8BBD9' },
  { day: 'Wed', amount: 65, color: '#C4B5FD' },
  { day: 'Thu', amount: 89, color: '#FDE68A' },
  { day: 'Fri', amount: 120, color: '#93C5FD' },
  { day: 'Sat', amount: 95, color: '#86EFAC' },
  { day: 'Sun', amount: 34, color: '#F8BBD9' },
];

const categoryData = [
  { name: "Groceries", amount: "₹346.78", percentage: "35%", color: "bg-chart-mint", trend: "up" },
  { name: "Dining", amount: "₹198.45", percentage: "20%", color: "bg-chart-pink", trend: "down" },
  { name: "Transportation", amount: "₹156.90", percentage: "16%", color: "bg-chart-lavender", trend: "up" },
  { name: "Shopping", amount: "₹134.23", percentage: "14%", color: "bg-chart-peach", trend: "up" },
  { name: "Entertainment", amount: "₹89.67", percentage: "9%", color: "bg-chart-sky", trend: "down" },
];

interface User {
  name: string;
  email: string;
  picture: string;
}

interface UserProps {
  user : User
}

export default function DashboardTab({user }: UserProps) {
  return (
    <div className="pt-20 pb-24 px-6 space-y-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Filter pills */}
        {/* <div className="flex gap-3 overflow-x-auto pb-2">
          <Button className="bg-primary text-primary-foreground rounded-2xl px-6 py-2 whitespace-nowrap shadow-sm">
            Expenses
          </Button>
          <Button variant="outline" className="border-border rounded-2xl px-6 py-2 whitespace-nowrap">
            Income
          </Button>
        </div> */}

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-0 shadow-sm bg-mint-light rounded-2xl">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold text-primary-foreground">₹526.03</p>
              {/* <div className="flex items-center justify-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12%</span>
              </div> */}
            </div>
          </Card>
          
          <Card className="p-4 border-0 shadow-sm bg-pink-light rounded-2xl">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-secondary-foreground">₹2,184.67</p>
              {/* <div className="flex items-center justify-center mt-1">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-500">-3%</span>
              </div> */}
            </div>
          </Card>
        </div>

        {/* Weekly spending chart */}
        <Card className="p-6 border-0 shadow-sm bg-card rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Weekly Spending</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis hide />
                <Bar 
                  dataKey="amount" 
                  radius={[8, 8, 0, 0]}
                  fill="#86EFAC"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Categories</h3>
          {categoryData.map((category, index) => (
            <Card key={index} className="p-4 border-0 shadow-sm bg-card rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${category.color} rounded-2xl`}></div>
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.percentage} of spending</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{category.amount}</p>
                  {/* <div className="flex items-center">
                    {category.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${category.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                      {category.trend === 'up' ? '+' : '-'}5%
                    </span>
                  </div> */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}