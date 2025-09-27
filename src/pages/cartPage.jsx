// CartPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import getTotal, { addToCart, loadCart } from "../utils/cart"

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
    return (
        <div className="flex items-center justify-between gap-6 p-4 rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-4">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-md size-20"
                //style={{ backgroundImage: `url(${item.image})` }}
                ><img className="rounded-md" src={item.image}/>
            </div>
            <div className="w-[180px]">
                <h3 className="text-base font-semibold mb-1">{item.name}</h3>
                <p className="text-xs text-secondary">
                    LKR {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            <button
                onClick={onRemove}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
            >
                Remove
            </button>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button
            onClick={onDecrease}
            className="flex h-6 w-6 items-center justify-center rounded-full border hover:bg-gray-300 transition-colors"
            >
            -
            </button>
            <span className="font-medium w-8 text-center">{item.quantity}</span>
            <button
            onClick={onIncrease}
            className="flex h-6 w-6 items-center justify-center rounded-full border hover:bg-gray-300 transition-colors"
            >
            +
            </button>
        </div>
        <p className="font-semibold w-30 text-right text-sm text-green-500">
            LKR {(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        </div>
    );
}

export default function CartPage() {
    const [cart, setCart] = useState(loadCart());

    const handleIncrease = (item) => {
        addToCart(item, 1);
        setCart(loadCart());
    };

    const handleDecrease = (item) => {
        addToCart(item, -1);
        setCart(loadCart());
    };

    const handleRemove = (item) => {
        addToCart(item, -item.quantity);
        setCart(loadCart());
    };

    const subtotal = getTotal();
    const taxes = subtotal * 0.00; // 8% example
    const total = subtotal + taxes;

    return (
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 bg-primary">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-[var(--tertiary)] mb-8">
                <a className="hover:text-[var(--accent)]" href="#">
                    Home
                </a>
                <span>/</span>
                <a className="hover:text-[var(--accent)]" href="#">
                    Shop
                </a>
                <span>/</span>
                <span className="text-[var(--secondary)]">Cart</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
                    <div className="space-y-4">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                        <CartItem
                            key={item.productID}
                            item={item}
                            onIncrease={() => handleIncrease(item)}
                            onDecrease={() => handleDecrease(item)}
                            onRemove={() => handleRemove(item)}
                        />
                        ))
                    ) : (
                        <p className="text-gray-500">Your cart is empty.</p>
                    )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-base">
                            <p className="text-secondary text-sm">Subtotal</p>
                            <p className="font-medium text-sm">LKR {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="flex justify-between text-base">
                            <p className="text-secondary text-sm">Shipping</p>
                            <p className="font-medium text-sm">Free</p>
                        </div>
                        <div className="flex justify-between text-base">
                            <p className="text-secondary text-sm">Taxes</p>
                            <p className="font-medium text-sm">LKR {taxes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 my-6"></div>
                    <div className="flex justify-between text-md font-bold">
                        <p>Total</p>
                        <p>LKR {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <Link
                        state={cart}
                        to="/checkout"
                        className="w-full mt-6 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-accent text-white text-base font-normal leading-normal tracking-wide hover:opacity-90 transition-opacity"
                    >
                        Proceed to Checkout
                    </Link>
                    </div>
                </div>
            </div>
        </div>
        </main>
    );
}
