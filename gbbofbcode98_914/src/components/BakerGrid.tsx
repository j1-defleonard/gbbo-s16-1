
"use client"

import type { Baker } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface BakerGridProps {
  bakers: (Baker | undefined)[];
  onBakerClick: (bakerId: string) => void;
  isSelectable: boolean;
}

export function BakerGrid({ bakers, onBakerClick, isSelectable }: BakerGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {bakers.map(baker => {
        if (!baker) return null;
        return (
          <Card 
            key={baker.id} 
            onClick={() => isSelectable && onBakerClick(baker.id)}
            className={cn(
              "text-center transition-all",
              isSelectable ? "cursor-pointer hover:shadow-lg hover:scale-105 hover:border-primary" : "opacity-70 cursor-not-allowed"
            )}
          >
            <CardContent className="p-3 flex flex-col items-center gap-2">
              <Avatar className="h-16 w-16 border-2">
                <AvatarImage src={baker.image} alt={baker.name} data-ai-hint={baker['data-ai-hint']} />
                <AvatarFallback>{baker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm leading-tight">{baker.name}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
