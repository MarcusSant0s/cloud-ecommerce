"use client";

import { Avatar, AvatarImage } from '@/primitives/Avatar'

export default function TestimonialAuthor({ author, className = "", text }) {
  return (
    <div
      className={`
        flex flex-col rounded-lg border-t
        bg-gradient-to-b from-muted/50 to-muted/10
        p-4 text-start transition-colors duration-300
        hover:from-muted/60 hover:to-muted/20
        sm:p-6
        max-w-[320px]
        ${className}    
      `}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>

        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none">
            {author.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {author.handle}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground sm:text-md">
        {text}
      </p>
    </div>
  );
}
