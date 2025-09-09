
"use client";

import { useAppContext } from "@/context/AppContext";
import { getBakerById } from "@/lib/utils";
import { eventDetails } from "@/lib/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";

export default function WeeklyLogPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const { bakers, getLeague } = useAppContext();
  const league = getLeague(leagueId);

  if (!league) {
    return <div>League not found</div>;
  }
  
  const { weeklyLogs } = league;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Weekly Log
        </h1>
        <p className="text-muted-foreground mt-2">
          A week-by-week breakdown of points and eliminations for <span className="font-bold text-primary">{league.name}</span>.
        </p>
      </header>
      
      {weeklyLogs.length === 0 ? (
        <Card>
            <CardContent className="p-6">
                <p className="text-muted-foreground">No weekly results have been logged for this league yet.</p>
            </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={`week-${weeklyLogs.length}`} className="w-full">
            <TabsList>
            {weeklyLogs.map((log) => (
                <TabsTrigger key={log.week} value={`week-${log.week}`}>
                Week {log.week}
                </TabsTrigger>
            ))}
            </TabsList>
            {weeklyLogs.map((log) => {
                const eliminatedBaker = log.eliminatedBakerId ? getBakerById(log.eliminatedBakerId, bakers) : null;
                return (
                    <TabsContent key={log.week} value={`week-${log.week}`}>
                        <Card>
                        <CardHeader>
                            <CardTitle>Week {log.week} Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {log.summary && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Episode Summary</h3>
                                    <p className="text-muted-foreground">{log.summary}</p>
                                </div>
                            )}

                            <Separator />

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Points Awarded</h3>
                                <div className="space-y-2">
                                    {log.events.map((event, index) => {
                                        const baker = getBakerById(event.bakerId, bakers);
                                        const detail = eventDetails[event.type];
                                        return (
                                            <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                                                <div>
                                                    <span className="font-medium">{baker?.name}</span>
                                                    <span className="text-muted-foreground ml-2">{detail.description}</span>
                                                </div>
                                                <span className={`font-bold ${detail.points > 0 ? 'text-primary' : 'text-destructive'}`}>
                                                    {detail.points > 0 ? '+' : ''}{detail.points}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Elimination</h3>
                                {eliminatedBaker ? (
                                    <p><span className="font-medium">{eliminatedBaker.name}</span> was eliminated from the competition.</p>
                                ) : (
                                    <p>No baker was eliminated this week.</p>
                                )}
                            </div>

                        </CardContent>
                        </Card>
                    </TabsContent>
                )
            })}
        </Tabs>
      )}

    </div>
  );
}
