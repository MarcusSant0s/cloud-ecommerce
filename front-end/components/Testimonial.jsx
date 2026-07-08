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
          mx-auto flex max-w-7xl flex-col items-center gap-10 text-center
          sm:gap-16
        `}
      >
        <div
          className={`
            flex flex-col items-center gap-4 px-4
          `}
        >
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Depoimentos
          </span>
          <h2
            className={`
              max-w-[720px] font-display text-3xl font-normal uppercase
              leading-tight tracking-[0.12em]
              sm:text-4xl
            `}
          >
            {title}
          </h2>
          <div className="h-px w-12 bg-foreground/30" />
          <p
            className={`
              max-w-[600px] text-sm text-muted-foreground
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
