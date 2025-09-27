import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
    { name: "Oil", value: 45, color: "#3b82f6" },
    { name: "Powder", value: 30, color: "#8b5cf6" },
    { name: "Raw", value: 15, color: "#10b981" },
    { name: "Others", value: 10, color: "#f59e0b" },
]

export default function SalesChart(){
    return(
        <div className="bg-white backdrop-blur-xl rounded-xl border
         border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 ">
                    Sales By Category
                </h3>
                <p className="text-sm text-slate-500 ">
                    Production Distribution
                </p>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: 'none', 
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-3">
                {data.map((item, index) => {
                    return <div className="flex items-center justify-between" key={index}>
                        <div className="flex itme-sce space-x-3">
                            <div className="w-3 h-3 rounded-full" 
                                style={{backgroundColor: item.color}}
                            />
                            <span className="text-sm text-slate-600">
                                {item.name}
                            </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-800">
                            {item.value}%
                        </div>
                    </div>
                })}
            </div>
        </div>
    )
}