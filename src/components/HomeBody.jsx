export default function HomeBody() {
  return (
    <div className="w-full h-full bg-[#f5f3f1] p-[60px]">

      <section
        className="flex min-h-[480px] flex-col items-center justify-center rounded-4xl gap-6 bg-cover bg-center bg-no-repeat p-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url('/homebg.png')",
        }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-white text-center">
          Embrace the Essence of Coconut
        </h1>
        <h2 className="text-base text-white text-center max-w-2xl">
          Discover the natural goodness of our coconut-based products, crafted with care and sustainability in mind.
        </h2>
        <button className="mt-4 rounded-full bg-[#38e07b] px-6 py-2 font-bold text-[#122118] hover:scale-105 transition">
          Shop Now
        </button>
      </section>

      <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800">Our System</h2>
        <p className="max-w-2xl text-base text-stone-600">
          At Coco Bliss, we're passionate about bringing you the finest coconut products. Our system focuses on sustainable sourcing, ethical practices, and quality craftsmanship to ensure every product is a testament to nature's bounty.
        </p>
      </section>

      <section className="px-6">
        <h2 className="text-center text-2xl font-bold text-stone-800 mb-6">
          Featured Categories
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-6">
          {[
            { name: "Coconut Water", img: "/img1.1.png" },
            { name: "Coconut Oil", img: "/img1.2.png" },
            { name: "Coconut Snacks", img: "/img1.3.png" },
            { name: "Coconut Milk", img: "/img1.4.png" },
          ].map((cat, i) => (
            <div key={i} className="flex flex-col gap-3 items-center">
              <div
                className="w-full aspect-square rounded-xl bg-cover bg-center shadow-md"
                style={{ backgroundImage: `url(${cat.img})` }}
              ></div>
              <p className="text-base font-medium text-stone-800">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800">Sustainability</h2>
        <p className="max-w-2xl text-base text-stone-600">
          We're committed to preserving the planet. Our sustainable practices include eco-friendly packaging, responsible sourcing, and supporting local communities. Join us in making a difference, one coconut at a time.
        </p>
      </section>
    </div>
  );
}
