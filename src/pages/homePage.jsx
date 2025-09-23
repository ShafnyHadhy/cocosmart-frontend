import { Route, Routes } from "react-router-dom";
import Header from "../components/header";
import ProductPage from "./productPage";
import Footer from "../components/footer";
import ProductOverview from "./admin/productOverview";
import CartPage from "./cartPage";
import CheckoutPage from "./checkoutPage";
import HomeBody from "../components/homeBody";
import TestimonialSection from "../components/testimonialSection";
import FeaturesCarousel from "../components/featuresSection";
import SubmitFeedback from "./feedback/SubmitFeedback";

export default function HomePage() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route index element={<>
          <HomeBody/>
          <FeaturesCarousel/>
          <TestimonialSection/>
          </>} />
        <Route path="product" element={<ProductPage />} />
        <Route path="about" element={<h1>About Us</h1>} />
        <Route path="contact" element={<h1>Contact Us</h1>} />
        <Route path="overview/:id" element={<ProductOverview/>}/>
        <Route path="cart" element={<CartPage/>}/>
        <Route path="checkout" element={<CheckoutPage/>}/>
        <Route path="feedback" element={<SubmitFeedback />} />
        <Route path="*" element={<h1>404 not found</h1>} />
      </Routes>
      
      <Footer/>
    </div>
  );
}
