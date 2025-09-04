export default function Footer() {
  return (
    <footer className="flex justify-center border-t border-solid border-stone-200 bg-medium-gray">
      <div className="flex w-full flex-1 flex-col">
        <div className="flex flex-col gap-10 px-5 py-10">
          
          <div className="flex flex-wrap items-start justify-center gap-6 md:flex-row md:justify-around">
            
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-sm font-bold text-stone-800">Shop</h3>
              <a className="min-w-40 text-base text-stone-600" href="#">Coconut Water</a>
              <a className="min-w-40 text-base text-stone-600" href="#">Coconut Oil</a>
              <a className="min-w-40 text-base text-stone-600" href="#">Coconut Snacks</a>
              <a className="min-w-40 text-base text-stone-600" href="#">Coconut Milk</a>
            </div>

            
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-sm font-bold text-stone-800">About</h3>
              <a className="min-w-40 text-base text-stone-600" href="#">Our Story</a>
              <a className="min-w-40 text-base text-stone-600" href="#">Sustainability</a>
              <a className="min-w-40 text-base text-stone-600" href="#">Recipes</a>
            </div>

           
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-sm font-bold text-stone-800">Support</h3>
              <a className="min-w-40 text-base text-stone-600" href="#">Contact Us</a>
              <a className="min-w-40 text-base text-stone-600" href="#">FAQ</a>
              <a className="min-w-40 text-base text-stone-600" href="#">Privacy Policy</a>
              <a className="min-w-40 text-base text-stone-600" href="#">Terms of Service</a>
            </div>
          </div>

          
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center gap-4 text-stone-600">
              <a href="#"><i className="fab fa-instagram text-xl"></i></a>
              <a href="#"><i className="fab fa-facebook text-xl"></i></a>
              <a href="#"><i className="fab fa-twitter text-xl"></i></a>
            </div>
            <p className="text-center text-base text-stone-600">
              ©2025 CocoSmart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
