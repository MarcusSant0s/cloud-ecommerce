
import * as AvatarPrimitive from "@radix-ui/react-avatar";
 

function Avatar({ className, ...props }) {
  return (
    <AvatarPrimitive.Root
      className={"relative flex size-8 shrink-0 overflow-hidden rounded-full"}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }) {
  return (
    <AvatarPrimitive.Fallback
      className={
        "flex size-full items-center justify-center rounded-full bg-muted"}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }) {
  return (
    <AvatarPrimitive.Image
      className={"aspect-square size-full"}
      data-slot="avatar-image"
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };