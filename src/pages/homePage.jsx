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
import UserProfile from "./Profile/UserProfile";
import ViewOrder from "./Profile/viewOrder";
import AboutUs from "./aboutUs";
import ContactUs from "./contactUs";

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
        <Route path="about" element={<AboutUs/>} />
        <Route path="contact" element={<ContactUs/>} />
        <Route path="overview/:id" element={<ProductOverview/>}/>
        <Route path="cart" element={<CartPage/>}/>
        <Route path="checkout" element={<CheckoutPage/>}/>
        <Route path="feedback" element={<SubmitFeedback />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="orders/id/:orderID" element={<ViewOrder />} />
        <Route path="*" element={<h1>404 not found</h1>} />
      </Routes>
      
      <Footer/>
    </div>
  );
}
