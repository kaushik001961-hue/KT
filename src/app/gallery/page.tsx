const galleryItems = [
  "International Trade",
  "Global Shipping",
  "Export Operations",
  "Import Operations",
  "Product Sourcing",
  "Supply Network",
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
              key={item}
              className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#07111f] via-[#1455a0] to-[#2d7dd2] shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >

              <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/80 via-transparent to-transparent" />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(155,207,255,0.25),transparent_40%)] opacity-80 transition duration-500 group-hover:scale-110" />

              <div className="absolute bottom-0 left-0 right-0 p-7">

                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9bcfff]">
                  0{index + 1}
                </div>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  {item}
                </h2>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}