import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Loader } from "../../components/loader";
import ImageSlider from "../../components/imageSlider";
import { addToCart } from "../../utils/cart";
import { GoCheckCircle } from "react-icons/go";

export default function ProductDetailsPage() {
    const params = useParams();
    const [status, setStatus] = useState("loading");
    const [product, setProduct] = useState(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/products/${params.id}`).then(
            (res) => {
                setProduct(res.data);
                setStatus("success");
            }
        ).catch(
            () => {
                toast.error("Failed to fetch product details");
                setStatus("error");
            }
        );
    }, [params.id]);

    if (status === "loading") return <Loader />;
    if (status === "error")
        return (
        <h1 className="text-red-500 text-center mt-12">
            Failed to load product details
        </h1>
    );

return (
    <div className="flex min-h-screen flex-col bg-primary text-[var(--secondary-color)]">
        <main className="container mx-auto flex-1 px-4 py-12 lg:px-8">

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            
                {/* Left: Images */}
                <div className="flex flex-col">
                    <div className="mb-4 text-sm">
                        <Link
                            className="text-[var(--tertiary-color)] hover:underline"
                            to="/shop"
                        >
                            Shop
                        </Link>
                        <span className="mx-2 text-[var(--tertiary-color)]">/</span>
                        <span className="text-[var(--secondary-color)]">{product.name}</span>
                    </div>

                    {/* Image Slider */}
                    <div className="w-full flex justify-center items-center">
                        <ImageSlider images={product.images} />
                    </div>

                    <h3 className="mb-8 text-2xl font-bold mt-20">Customer Reviews</h3>

                    <div className="ml-8 space-y-6 w-[500px]">
                        {[
                            { name: "Alice", rating: 5, comment: "Loved the coconut water, super refreshing and natural!" },
                            { name: "Diana", rating: 4, comment: "The packaging is neat and eco-friendly. Would recommend." },
                            { name: "Ethan", rating: 5, comment: "Tastes just like fresh coconuts from the beach." },
                            { name: "Farah", rating: 3, comment: "Good flavor, but I prefer it chilled for better taste." },
                            { name: "Gihan", rating: 5, comment: "I use it daily after my runs, feels so energizing!" },
                            { name: "Hana", rating: 4, comment: "Nice product, though I wish it came in larger bottles." },
                            { name: "Isuru", rating: 5, comment: "Best coconut oil I've tried—smells amazing and pure." }

                        ].map((review, index) => (
                            <div key={index} className="rounded-md border border-gray-300 p-4" >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">{review.name}</span>
                                    <span className="text-yellow-400">
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                    </span>
                                </div>
                                <p className="mt-2 text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Product Details */}
                <div className="w-[550px] flex flex-col gap-4 mt-8">

                    <h2 className="mb-2 text-4xl font-bold text-gray-800">{product.name}</h2>

                    {product.altNames.length > 0 && (
                    <h3 className="mb-4 text-xl font-medium text-gray-600 line-clamp-1">
                        {product.altNames.join(" | ")}
                    </h3>
                    )}

                    <p className="text-base text-gray-700 leading-relaxed mb-4">{product.description}</p>

                    <p className="text-sm text-gray-500 mb-2">Category: <span className="font-semibold text-gray-700">{product.category}</span></p>
                    <p className="text-xs text-gray-400 mb-6">Product ID: {product.productID}</p>

                    {product.labelledPrice > product.price ? (
                    <div className="flex items-baseline gap-3 mb-6">
                        <p className="text-2xl font-bold text-green-600">
                        LKR {product.price.toFixed(2)}
                        </p>
                        <p className="text-md font-medium text-gray-400 line-through">
                        LKR {product.labelledPrice.toFixed(2)}
                        </p>
                        <span className="ml-auto text-sm font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        {Math.round(
                            ((product.labelledPrice - product.price) / product.labelledPrice) * 100
                        )}% OFF
                        </span>
                    </div>
                    ) : (
                    <p className="text-2xl font-bold text-green-600 mb-6">
                        LKR {product.price.toFixed(2)}
                    </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <button
                        className="flex-1 rounded-lg bg-accent px-6 py-3 text-white font-semibold text-center transition-all hover:opacity-90"
                        onClick={() => {
                        addToCart(product, 1);
                        toast.success("Added to cart");
                        }}
                    >
                        Add to Cart
                    </button>

                    <Link
                        to="/checkout"
                        state={[
                        {
                            image: product.images[0],
                            productID: product.productID,
                            name: product.name,
                            price: product.price,
                            labelledPrice: product.labelledPrice,
                            quantity: 1,
                        },
                        ]}
                        className="flex-1 rounded-lg border border-accent px-6 py-3 text-accent font-semibold text-center transition-colors hover:bg-accent hover:text-white"
                    >
                        Buy Now
                    </Link>
                    </div>

                    {/* Specifications, Benefits, Reviews can go here */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="mb-4 text-xl font-bold mt-20">Specifications</h3>
                            <div className="divide-y divide-gray-300 rounded-md border border-gray-300">
                            <div className="grid grid-cols-3 gap-4 p-4">
                                <span className="font-medium text-[var(--tertiary-color)]">
                                Ingredients
                                </span>
                                <span className="col-span-2">100% Pure Coconut Water</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-4">
                                <span className="font-medium text-[var(--tertiary-color)]">Volume</span>
                                <span className="col-span-2">500ml</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-4">
                                <span className="font-medium text-[var(--tertiary-color)]">
                                Packaging
                                </span>
                                <span className="col-span-2">Recyclable PET Bottle</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-4">
                                <span className="font-medium text-[var(--tertiary-color)]">Shelf Life</span>
                                <span className="col-span-2">12 Months</span>
                            </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-bold mt-10">Benefits</h3>
                            <ul className="space-y-3">
                            {["Naturally Hydrating", "Rich in Electrolytes", "No Added Sugars", "Gluten-Free"].map((benefit) => (
                                <li key={benefit} className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[var(--accent-color)]">
                                    <GoCheckCircle />
                                </span>
                                <span>{benefit}</span>
                                </li>
                            ))}
                            </ul>
                        </div>

                        <section className="mt-20">
                            {/* Review Form */}
                            <form className="mt-8 space-y-4 rounded-md border border-gray-300 p-6 bg-white">
                            <h4 className="text-xl font-bold">Write a Review</h4>
                            <div>
                                <label className="mb-2 block font-medium">Name</label>
                                <input
                                type="text"
                                placeholder="Your name"
                                className="w-full rounded-md border border-gray-300 p-2"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block font-medium">Comment</label>
                                <textarea
                                placeholder="Write your review"
                                className="w-full rounded-md border border-gray-300 p-2"
                                rows={4}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="rounded-md bg-accent px-6 py-3 text-white transition-opacity hover:opacity-90"
                            >
                                Submit Review
                            </button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
            {/* Related Products */}
            <section className="mt-16">
                <h3 className="mb-8 text-2xl font-bold">Related Products</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                    { name: "Coconut Milk", price: "LKR 500.00", img: "/img1.1.png" },
                    { name: "Coconut Oil", price: "LKR 700.00", img: "/img1.2.png" },
                    { name: "Dried Coconut", price: "LKR 1200.00", img: "/img1.3.png" },
                    { name: "Coconut Sugar", price: "LKR 800.00", img: "/img1.4.png" },
                    ].map((product, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-lg border border-gray-300 transition hover:shadow-lg"
                    >
                        <img
                        src={product.img}
                        alt={product.name}
                        className="h-48 w-full object-cover"
                        />
                        <div className="p-4">
                            <h4 className="mb-2 text-lg font-semibold">{product.name}</h4>
                            <p className="mb-4 text-gray-600">{product.price}</p>
                            <button className="w-full rounded-md bg-accent px-4 py-2 text-white transition-opacity hover:opacity-90">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
            </section>
        </main>
    </div>
  );
}
