"use client"

import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { SparklesIcon } from "lucide-react"
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Badge } from "@/components/ui/badge"

interface CarouselProps {
  children: React.ReactNode[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
  title?: string
  subtitle?: string
  showBadge?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
  children,
  autoplayDelay = 3000,
  showPagination = true,
  showNavigation = true,
  title = "Featured Venues",
  subtitle = "Discover amazing venues near you",
  showBadge = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 375px;
    height: auto;
  }
  
  .swiper-slide > div {
    width: 100%;
    height: 100%;
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  `
  return (
    <section className="w-full space-y-4">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative mx-auto flex w-full flex-col">

          {(title || subtitle) && (
            <div className="flex flex-col justify-center pb-4 pt-8">
              <div className="flex gap-2">
                <div>
                  <h3 className="text-2xl opacity-85 font-bold tracking-tight">
                    {title}
                  </h3>
                  <p className="text-muted-foreground">{subtitle}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full items-center justify-center gap-4">
            <div className="w-full">
              <Swiper
                spaceBetween={20}
                autoplay={{
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                }}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                loop={children.length > 1}
                slidesPerView={"auto"}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2.5,
                }}
                pagination={showPagination}
                navigation={
                  showNavigation
                    ? {
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }
                    : undefined
                }
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
              >
                {children.map((child, index) => (
                  <SwiperSlide key={index}>
                    <div className="w-full h-full">
                      {child}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
