

"use client";

import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LeaguesPage() {
  const { leagues, createLeague, joinLeague, players, setActiveLeagueId, activeLeagueId } = useAppContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [newLeagueName, setNewLeagueName] = useState("");
  const [joinLeagueId, setJoinLeagueId] = useState("");
  
  const userPlayer = players.find(p => p.isUser);

  const handleCreateLeague = () => {
    if (userPlayer && newLeagueName) {
      const newLeagueId = createLeague(newLeagueName, userPlayer.id);
      toast({
        title: "League Created!",
        description: `Your league "${newLeagueName}" has been successfully created.`,
      });
      setNewLeagueName("");
      setActiveLeagueId(newLeagueId);
      router.push(`/leagues/${newLeagueId}`);
    }
  };

  const handleJoinLeague = () => {
    if (userPlayer && joinLeagueId) {
      const leagueExists = leagues.some(l => l.id === joinLeagueId);
      if (leagueExists) {
        joinLeague(joinLeagueId, userPlayer.id);
        toast({
          title: "Joined League!",
          description: `You have successfully joined the league.`,
        });
        setJoinLeagueId("");
        setActiveLeagueId(joinLeagueId);
        router.push(`/leagues/${joinLeagueId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "A league with that invite code does not exist.",
        });
      }
    }
  };

  const handleViewLeague = (leagueId: string) => {
      setActiveLeagueId(leagueId);
      router.push(`/leagues/${leagueId}`);
  }


  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
            <h1 className="text-4xl font-headline font-bold text-foreground">
            Your Leagues
            </h1>
            <p className="text-muted-foreground mt-2">
            Create a new league, join an existing one, or select a league to view.
            </p>
        </div>
        <div className="flex gap-2">
            <Dialog onOpenChange={(isOpen) => !isOpen && setNewLeagueName('')}>
                <DialogTrigger asChild>
                    <Button>Create League</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New League</DialogTitle>
                        <DialogDescription>
                            Give your new league a name to get started. Other players can join with the generated invite code.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="league-name">League Name</Label>
                        <Input id="league-name" value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button onClick={handleCreateLeague} disabled={!newLeagueName}>Create</Button>
                      </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
             <Dialog onOpenChange={(isOpen) => !isOpen && setJoinLeagueId('')}>
                <DialogTrigger asChild>
                    <Button variant="outline">Join League</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Join an Existing League</DialogTitle>
                        <DialogDescription>
                           Enter the invite code for the league you want to join.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="league-id">Invite Code</Label>
                        <Input id="league-id" value={joinLeagueId} onChange={(e) => setJoinLeagueId(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button onClick={handleJoinLeague} disabled={!joinLeagueId}>Join</Button>
                      </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <Card key={league.id} className={activeLeagueId === league.id ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>{league.name}</CardTitle>
              {league.isPreview ? (
                 <CardDescription>This is a preview league with sample data.</CardDescription>
              ) : (
                <CardDescription>Invite Code: <span className="font-mono bg-muted px-2 py-1 rounded">{league.id}</span></CardDescription>
              )}
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full" onClick={() => handleViewLeague(league.id)}>
                    View League
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
