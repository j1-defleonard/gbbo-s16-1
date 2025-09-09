

"use client";

import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from "@/context/AppContext";
import { getTeamScore, getBakerById } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hammer } from 'lucide-react';
import { useEffect } from 'react';

export default function LeagueStandingsPage() {
  const params = useParams();
  const router = useRouter();
  const { getLeague, players, bakers, setActiveLeagueId } = useAppContext();
  
  const leagueId = params.leagueId as string;
  const league = getLeague(leagueId);

  useEffect(() => {
    setActiveLeagueId(leagueId);
  }, [leagueId, setActiveLeagueId]);

  if (!league) {
    return (
      <div>
        <h1 className="text-2xl font-bold">League not found</h1>
        <p>The league you are looking for does not exist.</p>
        <Button asChild variant="link" className="mt-4 pl-0">
          <Link href="/leagues">
            <ArrowLeft className="mr-2" />
            Back to Leagues
          </Link>
        </Button>
      </div>
    );
  }
  
  const leaguePlayers = players.filter(p => league.players.includes(p.id));

  const standings = leaguePlayers
    .map((player) => {
      const team = league.teams.find((t) => t.playerId === player.id);
      const score = team ? getTeamScore(team, league.weeklyLogs, bakers) : 0;
      return { player, team, score };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8">
      <header>
         <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/leagues">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Leagues
            </Link>
        </Button>
        <h1 className="text-4xl font-headline font-bold text-foreground">
          {league.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Current rankings for your league. See who's rising to the top!
        </p>
      </header>

       {!league.draftState.isDraftComplete && (
        <Card className="bg-primary/5 border-primary">
            <CardHeader>
                <CardTitle>The Draft is In Progress!</CardTitle>
                <CardDescription>The teams aren't set yet. Head over to the draft room to make your picks.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.push(`/leagues/${leagueId}/draft`)}>
                    <Hammer className="mr-2 h-4 w-4" />
                    Go to Draft
                </Button>
            </CardContent>
        </Card>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Total Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map(({ player, team, score }, index) => (
                <TableRow key={player.id}>
                  <TableCell className="font-bold text-lg">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {team?.bakerIds.map((bakerId) => {
                        const baker = getBakerById(bakerId, bakers);
                        return (
                          <Avatar key={bakerId} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={baker?.image} alt={baker?.name} />
                            <AvatarFallback>
                              {baker?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary">
                    {score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
