import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
//import { BiTrash } from "react-icons/bi";
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

  function getTotal() {
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
    });
    return total;
  }

  async function purchaseCart(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("Please login to place an order!!!");
      navigate("/login");
      return;
    }

    try {
      const items = cart.map((item) => ({
        productID: item.productID,
        quantity: item.quantity,
      }));

      console.log({
        name: `${firstName} ${lastName}`,
        phone,
        address,
        items,
      });

      await axios.post(
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
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded-md"
                  >
                    {/* Left side: Image + Details */}
                    <div className="flex items-center gap-4">
                      {/* Product image */}
                      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-md size-20">
                        <img
                          className="rounded-md h-20 w-20 object-cover"
                          src={item.image}
                          alt={item.name}
                        />
                      </div>

                      {/* Product details */}
                      <div className="w-[200px]">
                        <h3 className="text-base font-semibold">{item.name}</h3>

                        {/* Quantity controls */}
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
                              if (newCart[index].quantity > 1) {
                                newCart[index].quantity -= 1;
                              }
                              setCart(newCart);
                            }}
                          />
                        </div>

                        {/* Remove small button */}
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

                    {/* Right side: Price */}
                    <div className="text-right">
                      {item.labelledPrice > item.price && (
                        <p className="line-through text-gray-400 text-sm">
                          LKR {item.labelledPrice.toFixed(2)}
                        </p>
                      )}
                      <p className="font-semibold text-accent text-md">
                        LKR {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="my-6 border-t border-gray-300"></div>
              <div className="flex justify-between">
                <p className="text-gray-500">Subtotal</p>
                <p>LKR {getTotal().toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Shipping</p>
                <p>Free</p>
              </div>
              <div className="my-6 border-t border-gray-300"></div>
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p className="text-green-500">LKR {getTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Billing & Shipping */}
          <div className="lg:order-1">
            <h1 className="mb-8 text-3xl font-bold">Billing &amp; Shipping</h1>
            <form className="space-y-6" onSubmit={purchaseCart}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-200 bg-white p-3 shadow-sm focus:border-accent focus:ring-accent"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-200 bg-white p-3 shadow-sm focus:border-accent focus:ring-accent"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone No
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-gray-200 bg-white p-3 shadow-sm focus:border-accent focus:ring-accent"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-200 bg-white p-3 shadow-sm focus:border-accent focus:ring-accent"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              {/*<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                    <label className="mb-2 block text-sm font-medium">City</label>
                    <input
                        type="text"
                        className="w-full rounded-md border-gray-300 bg-white p-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                        //value={city}
                        //onChange={(e) => setCity(e.target.value)}
                    />
                    </div>
                    <div>
                    <label className="mb-2 block text-sm font-medium">State</label>
                    <input
                        type="text"
                        className="w-full rounded-md border-gray-300 bg-white p-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                        //value={state}
                        //onChange={(e) => setState(e.target.value)}
                    />
                    </div>
                    <div>
                    <label className="mb-2 block text-sm font-medium">
                        Zip Code
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-md border-gray-300 bg-white p-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                        //value={zip}
                        //onChange={(e) => setZip(e.target.value)}
                    />
                    </div>
                </div>*/}

              {/* Payment Section (UI only, disabled) */}
              <h2 className="pt-10 text-2xl font-bold">Payment</h2>
              <div className="space-y-4 opacity-50 cursor-not-allowed">
                <label className="flex items-center gap-4 rounded-md border border-gray-300 bg-white p-4 shadow-sm">
                  <input type="radio" disabled checked />
                  <span className="font-medium">Credit Card</span>
                </label>
                <label className="flex items-center gap-4 rounded-md border border-gray-300 bg-white p-4 shadow-sm">
                  <input type="radio" disabled />
                  <span className="font-medium">PayPal</span>
                </label>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    htmlFor="cardNumber"
                  >
                    Card Number
                  </label>
                  <input
                    disabled
                    className="w-full rounded-md border-gray-300 bg-white p-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    type="text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium"
                      htmlFor="expirationDate"
                    >
                      Expiration Date
                    </label>
                    <input
                      disabled
                      className="w-full rounded-md border-gray-300 bg-white p-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                      id="expirationDate"
                      placeholder="MM/YY"
                      type="text"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium"
                      htmlFor="cvv"
                    >
                      CVV
                    </label>
                    <input
                      disabled
                      className="w-full rounded-md border-gray-300 bg-white p-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                      id="cvv"
                      placeholder="123"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-accent py-4 text-center font-bold text-white transition-colors hover:bg-opacity-90"
              >
                Place Order
              </button>
              <p className="flex items-center justify-center gap-2 text-center text-sm text-gray-500">
                <span className="material-symbols-outlined text-base">
                  lock
                </span>
                Secure payment (disabled in demo)
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
