import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "../../components/loader";
import OrderModal from "../../components/orderInfoModel";
import { RiFilterOffFill } from "react-icons/ri";
import { GoScreenFull } from "react-icons/go";
import { MdOutlineOpenInFull } from "react-icons/md";

export default function AdminOrdersPage(){

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // New states for search + filter
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // "" = All

    const navigate = useNavigate();

    useEffect(() => {
        if(isLoading){
            const token = localStorage.getItem("token");
            if(token == null){
                navigate("/login");
                return;
            }

            axios.get(import.meta.env.VITE_API_URL + "/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            }).then((response)=>{
                setOrders(response.data.orders);
                setIsLoading(false);
            });
        }
    }, [isLoading]);

    // Filter orders by search + date
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase());

        const orderDate = new Date(order.date);
        const afterStart = startDate ? orderDate >= new Date(startDate) : true;
        const beforeEnd = endDate ? orderDate <= new Date(endDate) : true;
        const matchesStatus = statusFilter ? order.status === statusFilter : true;

        return matchesSearch && afterStart && beforeEnd && matchesStatus;
    });

    return(
        <div className="h-full w-full p-6">

            <OrderModal 
                isModelOpen={isModelOpen} 
                closeModel={()=> setIsModelOpen(false)} 
                selectedOrder={selectedOrder} 
                refresh={()=> {setIsLoading(true)}} 
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>

                {/* Search + Date Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <input
                        type="text"
                        placeholder="Search by ID, Name, or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded-lg border-gray-300 text-sm w-64 focus:ring-1 focus:ring-accent focus:outline-none"
                    />
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="shipped">Shipping</option>
                        <option value="Processing">Processing</option>
                        <option value="pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <Link className="p-2 border rounded-lg border-gray-300 text-md hover:bg-gray-100 transition"  title="Clear Filter">
                        <RiFilterOffFill size={18} onClick={() => {
                            setSearchTerm("");
                            setStartDate("");
                            setEndDate("");
                            setStatusFilter("");
                        }}/>
                    </Link>
                </div>  
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-end mb-6 gap-4">
                <label className="self-center text-sm font-medium text-gray-700">From:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]} // disable future dates
                    className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                />
                <label className="self-center text-sm font-medium text-gray-700">To:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
                />
            </div>

            {/* Table Container */}
            <div className="w-full min h-full">
                {isLoading ? <Loader/> :
                <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-accent text-white sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-4 text-left rounded-tl-lg">Order ID</th>
                                <th className="py-3 px-4 text-center">Items</th>
                                <th className="py-3 px-4 text-left">Customer</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-right">Total</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center">Date</th>
                                <th className="py-3 px-4 text-center rounded-tr-lg">View Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((item, index) => (
                                <tr
                                    key={item.orderID}
                                    className={`border-b last:border-none hover:bg-gray-100 transition-colors ${
                                        index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                                    }`}
                                >
                                    <td className="py-3 px-4 font-medium">{item.orderID}</td>
                                    <td className="py-3 px-4 text-center">{item.items.length}</td>
                                    <td className="py-3 px-4">{item.customerName}</td>
                                    <td className="py-3 px-4">{item.email}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-gray-700">
                                        LKR {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                item.status === "Completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : item.status === "Cancelled"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Link title="View Order Details" className="pt-2">
                                            <MdOutlineOpenInFull size={18} className="mx-auto text-center text-gray-600 hover:text-gray-800 cursor-pointer"
                                                onClick={()=>{
                                                    setSelectedOrder(item);
                                                    setIsModelOpen(true);
                                                }}/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>
        </div>
    )
}
