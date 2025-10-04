// src/pages/admin/Overview.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight } from "lucide-react";

const Overview: React.FC = () => {
  // dummy data, replace with API later
  const stats = [
    { title: "Total Revenue", value: "$7,825", change: "+22%" },
    { title: "Total Orders", value: "$7,825", change: "+22%" },
    { title: "Conversion Rate", value: "$7,825", change: "+22%" },
  ];

  const orderTrend = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 8500 },
    { name: "Mar", value: 5500 },
    { name: "Apr", value: 7000 },
    { name: "May", value: 4000 },
    { name: "Jun", value: 4500 },
    { name: "Jul", value: 5000 },
    { name: "Aug", value: 3000 },
    { name: "Sep", value: 6000 },
    { name: "Oct", value: 8500 },
    { name: "Nov", value: 7000 },
    { name: "Dec", value: 4000 },
  ];

  const orderStatus = [
    { name: "Delivered", value: 64, color: "#16a34a" },
    { name: "Pending", value: 20, color: "#facc15" },
    { name: "Cancelled", value: 16, color: "#dc2626" },
  ];

  const users = [
    { name: "Jan", value: 3000 },
    { name: "Feb", value: 5000 },
    { name: "Mar", value: 2500 },
    { name: "Apr", value: 4200 },
    { name: "May", value: 3200 },
    { name: "Jun", value: 2800 },
    { name: "Jul", value: 3700 },
  ];

  return (
    <div className="p-6 mt-4 space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="shadow rounded-2xl">
            <CardContent className="p-4 flex flex-col">
              <span className="text-gray-500 text-sm">{item.title}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-semibold">{item.value}</span>
                <span className="flex items-center text-green-500 text-sm">
                  {item.change} <ArrowUpRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Trend */}
        <Card className="lg:col-span-2 shadow rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Order Trend overtime</h2>
              <button className="text-sm text-blue-500">Advanced Report</button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={orderTrend}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="shadow rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Order Status</h2>
              <button className="text-sm text-blue-500">More</button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {orderStatus.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </span>
                  <span>{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Users */}
        <Card className="shadow rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Users</h2>
              <button className="text-sm text-blue-500">Advanced Report</button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={users}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Orders</h2>
              <button className="text-sm text-blue-500">See all</button>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span>Order #1234</span> <span>$350</span>
              </li>
              <li className="flex justify-between">
                <span>Order #1235</span> <span>$825</span>
              </li>
              <li className="flex justify-between">
                <span>Order #1236</span> <span>$420</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
