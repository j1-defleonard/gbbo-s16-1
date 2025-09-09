

"use client";

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { getBakerById } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BakerGrid } from '@/components/BakerGrid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function DraftPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.leagueId as string;

  const { players, bakers, handleDraftPick, getLeague } = useAppContext();
  const league = getLeague(leagueId);
  
  if (!league) {
    return <div>Loading league...</div>
  }
  
  const { teams, draftState } = league;
  const { round, currentPlayerIndex, pickOrder, availableBakers, isDraftComplete } = draftState;
  
  const leaguePlayers = players.filter(p => league.players.includes(p.id));
  const user = players.find(p => p.isUser);
  const currentPlayerId = pickOrder[currentPlayerIndex];
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isUserTurn = user?.id === currentPlayerId;

  const onBakerSelect = (bakerId: string) => {
    if (isUserTurn && user) {
      handleDraftPick(leagueId, user.id, bakerId);
    }
  };
  
  if (isDraftComplete) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="text-4xl font-headline font-bold">Draft Complete!</h1>
            <p className="text-muted-foreground">The teams are set. Let the baking begin!</p>
            <Button onClick={() => router.push(`/leagues/${leagueId}`)}>
                View Standings
            </Button>
        </div>
    );
  }

  const availableBakerDetails = availableBakers.map(id => getBakerById(id, bakers)).filter(b => b);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold">The Great Fantasy Draft: {league.name}</h1>
        <p className="text-muted-foreground mt-2">Round {round} of 3</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Bakers</CardTitle>
              <CardDescription>Click on a baker to draft them to your team.</CardDescription>
            </CardHeader>
            <CardContent>
                <BakerGrid 
                    bakers={availableBakerDetails} 
                    onBakerClick={onBakerSelect}
                    isSelectable={isUserTurn}
                />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
            <Card className="bg-primary/5">
                <CardHeader>
                    <CardTitle>Draft Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant={isUserTurn ? "default" : "destructive"} className={isUserTurn ? "border-primary bg-primary/10" : ""}>
                       <AlertCircle className="h-4 w-4" />
                       <AlertTitle>{isUserTurn ? "It's Your Turn!" : "Waiting for other players..."}</AlertTitle>
                       <AlertDescription>
                           Currently picking: <span className="font-bold">{currentPlayer?.name}</span>
                       </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pick Order</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-3">
                        {pickOrder.map((playerId, index) => {
                            const player = players.find(p => p.id === playerId);
                            const isCurrent = index === currentPlayerIndex;
                            return (
                                <li key={playerId} className={`flex items-center gap-3 p-2 rounded-md ${isCurrent ? 'bg-primary/10' : ''}`}>
                                    <span className={`font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{index + 1}.</span>
                                    <span>{player?.name}</span>
                                </li>
                            )
                        })}
                    </ol>
                </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Teams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaguePlayers.map(player => {
                const team = teams.find(t => t.playerId === player.id);
                return (
                  <div key={player.id}>
                    <h3 className="font-semibold">{player.name}'s Team</h3>
                     <div className="flex items-center gap-2 mt-2">
                      {team?.bakerIds.map((bakerId) => {
                        const baker = getBakerById(bakerId, bakers);
                        return (
                          <Avatar key={bakerId} className="h-10 w-10 border-2 border-background">
                            <AvatarImage src={baker?.image} alt={baker?.name} />
                            <AvatarFallback>
                              {baker?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {[...Array(3 - (team?.bakerIds.length || 0))].map((_, i) => (
                        <div key={i} className="h-10 w-10 rounded-full bg-muted border-2 border-dashed flex items-center justify-center text-muted-foreground">?</div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
