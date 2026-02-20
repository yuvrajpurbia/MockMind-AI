import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export default function Carousel3D({ items, onSelect }) {
  return (
    <Swiper
      effect="coverflow"
      grabCursor={true}
      centeredSlides={true}
      slidesPerView="auto"
      coverflowEffect={{
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      }}
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      modules={[EffectCoverflow, Pagination, Autoplay]}
      className="w-full max-w-4xl"
    >
      {items.map((item, index) => (
        <SwiperSlide
          key={index}
          className="!w-64 !h-80 cursor-pointer"
          onClick={() => onSelect(item)}
        >
          <div className="w-full h-full glass-effect rounded-xl p-6 flex flex-col items-center justify-center hover:border-cyber-blue transition-all">
            <div className="text-5xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-bold neon-text">{item.label}</h3>
            <p className="text-cyber-blue-dim text-sm mt-2">{item.description}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
