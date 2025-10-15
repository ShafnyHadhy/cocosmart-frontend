import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [cart, setCart] = useState(location.state || []);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");
    const [errors, setErrors] = useState({});

    function getTotal() {
        let total = 0;
        cart.forEach((item) => {
            total += item.price * item.quantity;
        });
        return total;
    }

    const token = localStorage.getItem("token");

    function validateDetails(e) {

        if (token == null) {
            toast.error("Please login to place an order!!!");
            navigate("/login");
            return;
        }

        e?.preventDefault();

        if (!firstName.trim()) {
            toast.error("First name is required");
            return false;
        }
        if (!lastName.trim()) {
            toast.error("Last name is required");
            return false;
        }
        if (!/^\d{10}$/.test(phone)) {
            toast.error("Phone number must be exactly 10 digits");
            return false;
        }
        if (!address.trim() || address.length < 5) {
            toast.error("Please enter a valid address (min 5 characters)");
            return false;
        }

        return true;
    }

    async function purchaseCart(e) {
        //const token = localStorage.getItem("token");

        if (token == null) {
            toast.error("Please login to place an order!!!");
            navigate("/login");
            return;
        }

        // e.preventDefault();

        // if (!firstName.trim()) {
        //     toast.error("First name is required");
        //     return;
        // }
        // if (!lastName.trim()) {
        //     toast.error("Last name is required");
        //     return;
        // }
        // if (!/^\d{10}$/.test(phone)) {
        //     toast.error("Phone number must be exactly 10 digits");
        //     return;
        // }
        // if (!address.trim() || address.length < 5) {
        //     toast.error("Please enter a valid address (min 5 characters)");
        //     return;
        // }      

        try {
            const items = cart.map((item) => ({
                productID: item.productID,
                quantity: item.quantity,
            }));

            if(items.length === 0){
                toast.error("No items in the cart to place an Order");
                return;
            }

            const response = await axios.post(
                import.meta.env.VITE_API_URL + "/api/orders",
                {
                    name: `${firstName} ${lastName}`.trim(),
                    phone: phone,
                    address: `${address}`,
                    items: items,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Order placed successfully");
            navigate("/cart");

            const createdOrder = response.data;
            const orderID = createdOrder.order.orderID; 

            await axios.post(
                import.meta.env.VITE_API_URL + "/api/finances/createByOrder",
                {
                    items: items,
                    orderID: orderID,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

        } catch (error) {
            toast.error("Failed to place an Order");
            console.error(error);

            if (error.response && error.response.status === 400) {
                toast.error(error.response.data.message);
            }
        }
    }

    return (
        <div className="min-h-screen bg-primary py-8">
            <main className="container mx-auto flex-grow p-4 lg:p-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Order Summary */}
                    <div className="lg:order-2">
                        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-300">
                            <h2 className="mb-6 text-2xl font-bold">Order Summary</h2>
                            <div className="space-y-4">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-md size-20">
                                                <img
                                                    className="rounded-md h-20 w-20 object-cover"
                                                    src={item.image}
                                                    alt={item.name}
                                                />
                                            </div>
                                            <div className="w-[200px]">
                                                <h3 className="text-base font-semibold">{item.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <CiCircleChevUp
                                                        className="cursor-pointer text-xl"
                                                        onClick={() => {
                                                            const newCart = [...cart];
                                                            newCart[index].quantity += 1;
                                                            setCart(newCart);
                                                        }}
                                                    />
                                                    <span className="font-semibold">{item.quantity}</span>
                                                    <CiCircleChevDown
                                                        className="cursor-pointer text-xl"
                                                        onClick={() => {
                                                            const newCart = [...cart];
                                                            if (newCart[index].quantity > 1) newCart[index].quantity -= 1;
                                                            setCart(newCart);
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newCart = cart.filter((_, i) => i !== index);
                                                        setCart(newCart);
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {item.labelledPrice > item.price && (
                                                <p className="line-through text-gray-400 text-sm">
                                                    LKR {item.labelledPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            )}
                                            <p className="font-semibold text-accent text-md">
                                                LKR {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="my-6 border-t border-gray-300"></div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-500">
                                    <p>Subtotal</p>
                                    <p>
                                        LKR {cart.reduce((sum, item) => sum + item.labelledPrice * item.quantity, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <p>Discount</p>
                                    <p>
                                        LKR {cart.reduce((sum, item) => sum + (item.labelledPrice - item.price) * item.quantity, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <p>Shipping</p>
                                    <p>Free</p>
                                </div>
                            </div>
                            <div className="my-6 border-t border-gray-300"></div>
                            <div className="flex justify-between font-bold text-green-500">
                                <p>Total</p>
                                <p>
                                    LKR {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Billing & Shipping */}
                    <div className="lg:order-1">
                        <h1 className="mb-8 text-3xl font-bold">Billing &amp; Shipping</h1>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border text-sm border-gray-200 bg-white p-3 shadow-sm focus:border-accent focus:ring-accent"
                                        value={firstName}
                                        placeholder="First Name"
                                        onChange={(e) => setFirstName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (!/^[a-zA-Z ]$/.test(e.key)) e.preventDefault();
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm rounded-md border border-gray-200 bg-white p-3 shadow-sm focus:border-accent focus:ring-accent"
                                        value={lastName}
                                        placeholder="Last Name"
                                        onChange={(e) => setLastName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (!/^[a-zA-Z ]$/.test(e.key)) e.preventDefault();
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Phone No</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border text-sm border-gray-200 bg-white p-3 shadow-sm focus:border-accent focus:ring-accent"
                                    value={phone}
                                    placeholder="Phone Number"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, ""); 
                                        if (val.length <= 10) setPhone(val);
                                    }}
                                    maxLength={10} 
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Address</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border text-sm border-gray-200 bg-white p-3 shadow-sm focus:border-accent focus:ring-accent"
                                    value={address}
                                    placeholder="Delivery Address"
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            {/* Payment Section */}
                            <h2 className="pt-10 text-2xl font-bold">Payment</h2>
                            <p className="text-sm text-gray-500 mb-4">Mock payment gateway enabled</p>

                            <button
                                type="button"
                                onClick={() => {
                                    const valid = validateDetails(new Event("submit"));
                                    if (valid) {
                                        setShowPaymentModal(true);
                                    }
                                }}
                                className="w-full rounded-md bg-accent py-4 text-center font-bold text-white transition-colors hover:bg-opacity-90"
                            >
                                Proceed to Payment
                            </button>
                        </form>
                    </div>
                </div>

                {/* Mock Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-96 relative border border-gray-100">
                            {/* Header */}
                            <h2 className="text-2xl font-semibold mb-2 text-center text-gray-800">Secure Card Payment</h2>
                            <p className="text-sm text-gray-500 mb-6 text-center">
                            Enter fake card details to simulate a transaction
                            </p>

                            {/* Card Fields */}
                            <div className="space-y-4">
                            {/* Card Number */}
                            <div>
                                <label className="text-xs font-medium text-gray-600">Card Number</label>
                                <div className="flex items-center border rounded-lg shadow-sm px-3 py-2 bg-white focus-within:ring-1 focus-within:ring-accent transition">
                                <input
                                    type="text"
                                    placeholder="XXXX XXXX XXXX XXXX"
                                    maxLength={16}
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                                    className="w-full text-sm bg-transparent outline-none"
                                />
                                </div>
                                {errors.cardNumber && (
                                <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                                )}
                            </div>

                            {/* Expiry & CVV */}
                            <div className="flex gap-4">
                                {/* Expiry */}
                                <div className="flex-1">
                                <label className="text-xs font-medium text-gray-600">Expiry</label>
                                <div className="flex gap-2">
                                    <select
                                    value={expiryMonth}
                                    onChange={(e) => setExpiryMonth(e.target.value)}
                                    className="w-1/2 border rounded-lg shadow-sm p-2 text-sm bg-white focus:ring-accent focus:border-accent transition"
                                    >
                                    <option value="">MM</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                                        {String(i + 1).padStart(2, "0")}
                                        </option>
                                    ))}
                                    </select>

                                    <select
                                    value={expiryYear}
                                    onChange={(e) => setExpiryYear(e.target.value)}
                                    className="w-1/2 border rounded-lg shadow-sm p-2 text-sm bg-white focus:ring-accent focus:border-accent transition"
                                    >
                                    <option value="">YY</option>
                                    {[...Array(12)].map((_, i) => {
                                        const year = new Date().getFullYear() + i;
                                        return (
                                        <option key={year} value={year.toString().slice(-2)}>
                                            {year}
                                        </option>
                                        );
                                    })}
                                    </select>
                                </div>
                                {errors.expiry && (
                                    <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>
                                )}
                                </div>

                                {/* CVV */}
                                <div className="flex-1">
                                <label className="text-xs font-medium text-gray-600">CVV</label>
                                <input
                                    type="text"
                                    placeholder="CVV"
                                    maxLength={3}
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                                    className="w-full border rounded-lg shadow-sm p-2 text-sm bg-white focus:ring-accent focus:border-accent transition"
                                />
                                {errors.cvv && (
                                    <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>
                                )}
                                </div>
                            </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between mt-8">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                const newErrors = {};
                                if (!/^\d{16}$/.test(cardNumber))
                                    newErrors.cardNumber = "Card number must be 16 digits";
                                if (!expiryMonth || !expiryYear) {
                                    newErrors.expiry = "Expiry month and year are required";
                                } else {
                                    const currentYear = new Date().getFullYear() % 100;
                                    const currentMonth = new Date().getMonth() + 1;
                                    const expMonth = parseInt(expiryMonth);
                                    const expYear = parseInt(expiryYear);
                                    if (
                                    expYear < currentYear ||
                                    (expYear === currentYear && expMonth < currentMonth)
                                    ) {
                                    newErrors.expiry = "Card has expired";
                                    }
                                }
                                if (!/^\d{3}$/.test(cvv)) newErrors.cvv = "CVV must be 3 digits";
                                setErrors(newErrors);
                                if (Object.keys(newErrors).length > 0) return;

                                setIsPaying(true);
                                toast.loading("Processing payment...");
                                setTimeout(() => {
                                    toast.dismiss();
                                    toast.success("Payment successful!");
                                    setShowPaymentModal(false);
                                    setIsPaying(false);
                                    purchaseCart(new Event("submit"));
                                }, 2000);
                                }}
                                disabled={isPaying}
                                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 text-white font-semibold hover:opacity-90 shadow-md transition"
                            >
                                {isPaying ? "Processing..." : "Pay Now"}
                            </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
