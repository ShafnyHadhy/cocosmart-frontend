import { TbBackground } from "react-icons/tb";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function RevenueChart(){

    const financeData = [
        { month: "Jan", revenue: 12000, expenses: 8000 },
        { month: "Feb", revenue: 15000, expenses: 9000 },
        { month: "Mar", revenue: 18000, expenses: 10000 },
        { month: "Apr", revenue: 14000, expenses: 9500 },
        { month: "May", revenue: 20000, expenses: 12000 },
        { month: "Jun", revenue: 22000, expenses: 13000 },
        { month: "Jul", revenue: 24000, expenses: 15000 },
        { month: "Aug", revenue: 26000, expenses: 16000 },
        { month: "Sep", revenue: 21000, expenses: 14000 },
        { month: "Oct", revenue: 23000, expenses: 15000 },
        { month: "Nov", revenue: 25000, expenses: 17000 },
        { month: "Dec", revenue: 30000, expenses: 20000 },
    ];

    return(
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border
        border-slate-200/50 dark:border-slate-700/50 p-6"> {/*dark:bg-slate-900/80  */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Revenue Chart</h3> {/* dark:text-white */}
                    <p className="text-sm text-slate-500 dark:text-slate-400">Monthly revenue and expenses</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"> </div>
                        <div className="text-sm text-slate-600"> {/* dark:text-slate-400 */}
                            <span>Revenue</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"> </div>
                        <div className="text-sm text-slate-600"> {/* dark:text-slate-400 */}
                            <span>Expenses</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={financeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid 
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            opacity={0.3} 
                        />
                        <XAxis 
                            dataKey="month"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value.toLocaleString()}`, ""]}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="url(#revenueGradient)"
                            radius={[4, 4, 0, 0]}
                            maxSize={40}
                        />
                        <Bar 
                            dataKey="expenses"
                            fill="url(#expenseGradient)"
                            radius={[4, 4, 0, 0]}
                            maxSize={40}
                        />
                        <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6"/>
                            <stop offset="100%" stopColor="#8b5cf6"/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#94a3b8"/>
                            <stop offset="100%" stopColor="#64748b"/>
                        </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}