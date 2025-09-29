import { BiShoppingBag } from "react-icons/bi";
import { BsArrowDownRight, BsArrowUpRight, BsEye } from "react-icons/bs";
import { FaDollarSign, FaUserSecret } from "react-icons/fa";
import { SiExpensify } from "react-icons/si";

const stats = [
  {
    title: "Total Revenue",
    value: "LKR 522,082.00",
    change: "+12.5%",
    trend: "up",
    icon: FaDollarSign,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Total Expense",
    value: "LKR 231,950.00",
    change: "+2.8%",
    trend: "up",
    icon: SiExpensify,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Active Users",
    value: "20",
    change: "+1.2%",
    trend: "up",
    icon: FaUserSecret,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Total Orders",
    value: "45",
    change: "-1.4%",
    trend: "down",
    icon: BiShoppingBag,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
  },
];

export default function StatsGrid(){
    return(
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stats, index) =>{
                return (
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4
                        border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl
                        hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300
                        group" key={index}> {/* dark:bg-slate-900/80 */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 mb-2"> {/*dark:text-slate-400 */}
                            {stats.title}
                            </p>
                            <p className="text-lg mb-2 font-bold text-slate-800"> {/*dark:text-slate-200 */}
                                {stats.value}
                            </p>
                            <div className="flex items-center space-x-2">
                               {stats.trend === "up" ? (
                                <BsArrowUpRight className="w-4 h-4 text-emerald-500"/>
                               ) : (
                                <BsArrowDownRight className="w-4 h-4 text-red-500"/>
                               )}
                                <span className={`text-xs font-semibold ${
                                    stats.trend === "up" ? "text-emerald-500" : "text-red-500"
                                }`}>{stats.change}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    vs Last Month
                                </span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl ${stats.bgColor} group-hover:scale-110 tracking-all duration-300`}>
                            {<stats.icon className={`w-4 h-4 ${stats.textColor}`} />}
                        </div>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="mt-4 h-2 bg-slate-300 rounded-full overflow-hidden relative">
                    {/* Progress Fill */}
                    <div
                        className={`absolute left-0 top-0 h-2 bg-gradient-to-r ${stats.color} rounded-full`}
                        style={{ width: stats.trend === "up" ? "75%" : "45%" }}
                    ></div>
                    </div>
                </div> 
                )
            })}   
        </div>
    )
}