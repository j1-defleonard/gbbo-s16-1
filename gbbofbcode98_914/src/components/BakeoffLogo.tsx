import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function BakeoffLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <WhiskIcon className="h-6 w-6 text-primary" {...props} />
      <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
        Bake Off Fantasy
      </h1>
    </div>
  );
}

function WhiskIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 18a2 2 0 0 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M12 18a2 2 0 0 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M14 22V8a2 2 0 0 0-2-2" />
      <path d="M10 22V8a2 2 0 1 0-4 0" />
      <path d="m14 14-2.5-2.5" />
      <path d="m10 14 2.5-2.5" />
    </svg>
  );
}
