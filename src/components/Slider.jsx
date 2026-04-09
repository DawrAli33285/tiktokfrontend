import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const images = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
  "https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80",
];

export default function ImageStrip() {
  const [sliderRef] = useKeenSlider(
    {
      loop: true,
      slides: { perView: 1.5, spacing: 12 },
      breakpoints: {
        "(min-width: 640px)": { slides: { perView: 2.5, spacing: 12 } },
        "(min-width: 1024px)": { slides: { perView: 4.5, spacing: 12 } },
      },
    },
    [
      (slider) => {
        let timeout;
        function nextSlide() {
          timeout = setTimeout(() => {
            slider.next();
            nextSlide();
          }, 2500);
        }
        slider.on("created", nextSlide);
        slider.on("destroyed", () => clearTimeout(timeout));
      },
    ]
  );

  return (
    <div className="bg-black py-6 overflow-hidden w-full">
      <div ref={sliderRef} className="keen-slider">
        {images.map((src, i) => (
          <div key={i} className="keen-slider__slide">
            <div className="rounded-[20px] overflow-hidden h-[400px]">
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover block"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}