"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/primitives/Avatar";

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={
            i < rating
              ? "h-3 w-3 fill-bn-gold text-bn-gold"
              : "h-3 w-3 text-bn-gold/25"
          }
        />
      ))}
    </div>
  );
}

export default function TestimonialAuthor({ author, className = "", text, rating }) {
  const initials = (author?.name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <figure
      className={`flex max-w-[320px] flex-col rounded-sm border border-border/60 bg-card p-5 text-start transition-colors duration-300 hover:border-bn-gold/40 sm:p-6 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          {author?.avatar && <AvatarImage src={author.avatar} alt="" />}
          <AvatarFallback className="text-xs tracking-[0.1em]">{initials}</AvatarFallback>
        </Avatar>

        <figcaption className="flex min-w-0 flex-col items-start gap-1">
          {/* Os termos da Places API exigem manter a atribuição do autor. */}
          {author?.uri ? (
            <a
              href={author.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {author.name}
            </a>
          ) : (
            <span className="truncate text-sm font-medium text-foreground">{author?.name}</span>
          )}
          <Stars rating={rating} />
        </figcaption>
      </div>

      <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {text}
      </blockquote>

      {author?.handle && (
        <p className="mt-3 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/70">
          {author.handle}
        </p>
      )}
    </figure>
  );
}
