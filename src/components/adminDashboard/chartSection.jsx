import RevenueChart from "./revenueChart";
import SalesChart from "./salesChart";

export default function ChartSection(){
    return(
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white backdrop-blur-xl rounded-2xl"> {/*dark:bg-slate-900/80 */}
                <RevenueChart/>
            </div>
            <div className="space-y-6">
                <SalesChart/>
            </div>
        </div>
    )
}