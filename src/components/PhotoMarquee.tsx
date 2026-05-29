import img1 from "@/assets/carousel-1.png";
import img2 from "@/assets/carousel-2.png";
import img3 from "@/assets/carousel-3.png";
import img4 from "@/assets/carousel-4.png";
import img5 from "@/assets/carousel-5.png";

const images = [
  { src: img1, alt: "Top Truck - Proteção Veicular" },
  { src: img2, alt: "Top Truck - Clube de Benefícios" },
  { src: img3, alt: "Top Truck - Assistência 24h" },
  { src: img4, alt: "Top Truck - Parceiros Exclusivos" },
  { src: img5, alt: "Top Truck - Atendimento Humanizado" },
];

export function PhotoMarquee() {
  const loop = [...images, ...images];
  return (
    <section
      aria-label="Galeria Top Truck"
      className="border-y bg-secondary/30 py-10"
    >
      <div
        className="group relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
          {loop.map((img, i) => (
            <div
              key={i}
              className="relative h-40 w-72 flex-shrink-0 overflow-hidden rounded-xl shadow-[var(--shadow-elegant)] ring-1 ring-border md:h-56 md:w-96"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                width={1280}
                height={768}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
