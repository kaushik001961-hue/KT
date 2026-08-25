const galleryItems = [
  {
    title: "International Trade",
    image: "/images/gallery/01-international-trade.jpg",
  },
  {
    title: "Global Shipping",
    image: "/images/gallery/02-global-shipping.jpg",
  },
  {
    title: "Export Operations",
    image: "/images/gallery/03-export-operations.jpg",
  },
  {
    title: "Import Operations",
    image: "/images/gallery/04-import-operations.jpg",
  },
  {
    title: "Product Sourcing",
    image: "/images/gallery/05-product-sourcing.jpg",
  },
  {
    title: "Supply Network",
    image: "/images/gallery/06-supply-network.jpg",
  },
];

export default function GalleryPage() {
  return (
    <main className="gradient-section">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden px-5 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">

        <div className="mx-auto max-w-5xl text-center">

          <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
            Gallery
          </div>

          <h1 className="mx-auto mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            <span className="gradient-text">
              Our world of trade.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--foreground)]/65">
            A visual introduction to the international trading
            environment behind Krupali Traders Private Limited.
          </p>

        </div>

      </section>

      {/* =====================================================
          GALLERY
      ===================================================== */}

      <section className="px-5 pb-24 lg:px-8">

        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {galleryItems.map((item, index) => (

            <div
              key={item.title}
              className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-lg transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >

              {/* =================================================
                  IMAGE
              ================================================= */}

              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
              />

              {/* =================================================
                  DARK OVERLAY
              ================================================= */}

              <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/90 via-[#07111f]/25 to-transparent" />

              {/* =================================================
                  HOVER GLOW
              ================================================= */}

              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-400/10 opacity-0 transition duration-500 group-hover:opacity-100" />

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="absolute bottom-0 left-0 right-0 p-7">

                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9bcfff]">
                  0{index + 1}
                </div>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  {item.title}
                </h2>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}