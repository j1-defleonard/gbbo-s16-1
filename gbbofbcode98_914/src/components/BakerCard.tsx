
import type { Baker, WeeklyLog } from "@/lib/types";
import { calculateBakerScore } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface BakerCardProps {
  baker: Baker;
  weeklyLogs: WeeklyLog[];
  bakers: Baker[];
  actions?: React.ReactNode;
}

export function BakerCard({ baker, weeklyLogs, bakers, actions }: BakerCardProps) {
  const score = calculateBakerScore(baker.id, weeklyLogs, bakers);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-4">
        <Image
          src={baker.image}
          alt={baker.name}
          width={80}
          height={80}
          className="rounded-full border-2 border-primary"
          data-ai-hint={baker['data-ai-hint']}
        />
        <div className="flex-1">
          <CardTitle className="font-headline text-2xl">{baker.name}</CardTitle>
          {baker.status === "eliminated" ? (
            <Badge variant="destructive" className="mt-2">Eliminated</Badge>
          ) : (
            <Badge variant="secondary" className="mt-2">Active</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-center bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Points</p>
          <p className="text-4xl font-bold text-primary">{score}</p>
        </div>
      </CardContent>
      {actions && (
        <CardFooter className="flex justify-end gap-2">
            {actions}
        </CardFooter>
      )}
    </Card>
  );
}
