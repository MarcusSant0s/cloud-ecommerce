"use client";

import { animate } from "animejs";
import React, { useEffect, useRef } from "react";

import TestimonialAuthor from '@/primitives/TestimonialAuthor';

export default function Testimonial({
  description,
  testimonials,
  title,
}) {
  const marqueeRef = useRef(null);
  const animationRef = useRef(null);
  const isHoveredRef = useRef(false);
 
  useEffect(() => {
    if (!marqueeRef.current) return;

    const marqueeElement = marqueeRef.current;
    const itemWidth = marqueeElement.scrollWidth / 4; // 4 sets

    const setupAnimation = () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }

      animationRef.current = animate(marqueeElement, {
        duration: 40000,
        easing: "linear",
        loop: true,
        translateX: ["0px", `-${itemWidth}px`],
      });

      if (isHoveredRef.current) {
        animationRef.current.pause();
      }
    };

    setupAnimation();

    const handleResize = () => {
      setupAnimation();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, []);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (animationRef.current) {
      animationRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (animationRef.current) {
      animationRef.current.play();
    }
  };

  return (
    <section
      className={
        "bg-background text-foreground px-0 py-12 sm:py-24 md:py-32 "}
    >
      <div
        className={`
          max-w-container mx-auto flex flex-col items-center gap-4 text-center
          sm:gap-16
        `}
      >
        <div
          className={`
            flex flex-col items-center gap-4 px-4
            sm:gap-8
          `}
        >
          <h2
            className={`
              max-w-[720px] text-3xl leading-tight font-semibold
              sm:text-5xl sm:leading-tight
            `}
          >
            {title}
          </h2>
          <p
            className={`
              text-md max-w-[600px] font-medium text-muted-foreground
              sm:text-xl
            `}
          >
            {description}
          </p>
        </div>

        <div
          className={`
            relative flex w-full flex-col items-center justify-center
            overflow-hidden
          `}
        >
          <div
            className={`
              flex flex-row overflow-hidden p-2
              [gap:var(--gap)]
              [--gap:1rem]
            `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`
                flex shrink-0 flex-row justify-around
                [gap:var(--gap)]
              `}
              ref={marqueeRef}
              style={{ translate: "none" }}
            >
              {[...Array(4)].map((_, setIndex) =>
                testimonials.map((testimonial, i) => (
                  <TestimonialAuthor
                    key={`testimonial-${testimonial.author.name}-${setIndex}-${i}`}
                    {...testimonial}
                  />
                ))
              )}
            </div>
          </div>

          <div
            className={`
              pointer-events-none absolute inset-y-0 left-0 hidden w-1/3
              bg-gradient-to-r from-background
              sm:block
            `}
          />
          <div
            className={`
              pointer-events-none absolute inset-y-0 right-0 hidden w-1/3
              bg-gradient-to-l from-background
              sm:block
            `}
          />
        </div>
      </div>
    </section>
  );
}
