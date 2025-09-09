
"use client";

import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { getBakerById } from "@/lib/utils";
import { BakerCard } from "@/components/BakerCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRightLeft, Trash2, PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Baker, Player, Team } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function MyTeamPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const { players, bakers, tradeBakers, dropAddBakers, getLeague } = useAppContext();
  const league = getLeague(leagueId);

  const [isTradeModalOpen, setTradeModalOpen] = useState(false);
  const [isDropAddSheetOpen, setDropAddSheetOpen] = useState(false);
  const [bakerToDrop, setBakerToDrop] = useState<Baker | null>(null);

  const [isDropAddFromUnclaimedDialogOpen, setDropAddFromUnclaimedDialogOpen] = useState(false);
  const [bakerToAdd, setBakerToAdd] = useState<Baker | null>(null);

  if (!league) {
     return <div>League not found</div>
  }

  const user = players.find((p) => p.isUser);
  const userTeam = league.teams.find((t) => t.playerId === user?.id);

  const allClaimedBakerIds = new Set(league.teams.flatMap((t) => t.bakerIds));
  const unclaimedBakers = bakers.filter(
    (b) => !allClaimedBakerIds.has(b.id) && b.status === "active"
  );

  const handleOpenDropSheet = (baker: Baker) => {
    setBakerToDrop(baker);
    setDropAddSheetOpen(true);
  };
  
  const handleDropAdd = (bakerToAddId: string) => {
    if (user && bakerToDrop) {
      dropAddBakers(leagueId, user.id, bakerToDrop.id, bakerToAddId);
      setDropAddSheetOpen(false);
      setBakerToDrop(null);
    }
  }

  const handleOpenDropAddFromUnclaimed = (baker: Baker) => {
    setBakerToAdd(baker);
    setDropAddFromUnclaimedDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-foreground">
          My Team
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your roster of bakers for the season in the <span className="font-bold text-primary">{league.name}</span> league.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Your Roster</h2>
        {userTeam && userTeam.bakerIds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTeam.bakerIds.map((bakerId) => {
              const baker = getBakerById(bakerId, bakers);
              if (!baker) return null;
              return (
                <BakerCard
                  key={bakerId}
                  baker={baker}
                  weeklyLogs={league.weeklyLogs}
                  bakers={bakers}
                  actions={
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTradeModalOpen(true)}
                      >
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Trade
                      </Button>
                       <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenDropSheet(baker)}
                        disabled={baker.status === 'eliminated'}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Drop
                      </Button>
                    </>
                  }
                />
              );
            })}
          </div>
        ) : (
           <Card className="text-center">
                <CardContent className="p-8">
                    <p className="mb-4">You have not drafted a team in this league yet.</p>
                    {!league.draftState.isDraftComplete && (
                        <Button asChild>
                            <Link href={`/leagues/${leagueId}/draft`}>Go to Draft</Link>
                        </Button>
                    )}
                </CardContent>
           </Card>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">
          Unclaimed Bakers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {unclaimedBakers.map((baker) => (
            <Card key={baker.id}>
              <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                <Avatar>
                  <AvatarImage src={baker.image} alt={baker.name} />
                  <AvatarFallback>{baker.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-sm">{baker.name}</p>
                <Button size="sm" variant="outline" className="w-full mt-auto" onClick={() => handleOpenDropAddFromUnclaimed(baker)} disabled={userTeam?.bakerIds.length === 0}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <TradeModal
        isOpen={isTradeModalOpen}
        setOpen={setTradeModalOpen}
        user={user}
        userTeam={userTeam}
        players={players}
        teams={league.teams}
        bakers={bakers}
        leagueId={leagueId}
        onTrade={tradeBakers}
      />
      
      <Sheet open={isDropAddSheetOpen} onOpenChange={setDropAddSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Drop Baker &amp; Add New</SheetTitle>
            <SheetDescription>
                You are dropping <span className="font-bold">{bakerToDrop?.name}</span>. Select an unclaimed baker to add to your roster.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
              <Label>Select New Baker</Label>
              <Select onValueChange={handleDropAdd}>
                  <SelectTrigger>
                      <SelectValue placeholder="Choose a baker..." />
                  </SelectTrigger>
                  <SelectContent>
                      {unclaimedBakers.map(baker => (
                          <SelectItem key={baker.id} value={baker.id}>
                              {baker.name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDropAddSheetOpen(false)}>Cancel</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <DropAddFromUnclaimedDialog
        isOpen={isDropAddFromUnclaimedDialogOpen}
        setOpen={setDropAddFromUnclaimedDialogOpen}
        userTeam={userTeam}
        bakers={bakers}
        bakerToAdd={bakerToAdd}
        onDropAdd={(bakerToDropId) => {
            if (user && bakerToAdd) {
                dropAddBakers(leagueId, user.id, bakerToDropId, bakerToAdd.id);
                setDropAddFromUnclaimedDialogOpen(false);
                setBakerToAdd(null);
            }
        }}
    />

    </div>
  );
}

interface TradeModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  user?: Player;
  userTeam?: Team;
  players: Player[];
  teams: Team[];
  bakers: Baker[];
  leagueId: string;
  onTrade: (leagueId: string, userPlayerId: string, userBakerId: string, otherPlayerId: string, otherBakerId: string) => void;
}

function TradeModal({ isOpen, setOpen, user, userTeam, players, teams, bakers, leagueId, onTrade }: TradeModalProps) {
  const [tradePartnerId, setTradePartnerId] = useState<string>('');
  const [userBakerId, setUserBakerId] = useState<string>('');
  const [partnerBakerId, setPartnerBakerId] = useState<string>('');
  
  const otherPlayers = players.filter(p => !p.isUser);
  const tradePartnerTeam = teams.find(t => t.playerId === tradePartnerId);
  
  const handleSubmit = () => {
    if (user && user.id && userBakerId && tradePartnerId && partnerBakerId) {
      onTrade(leagueId, user.id, userBakerId, tradePartnerId, partnerBakerId);
      setOpen(false);
      // Reset form
      setTradePartnerId('');
      setUserBakerId('');
      setPartnerBakerId('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Propose a Trade</DialogTitle>
          <DialogDescription>
            Select a player and bakers to propose a trade.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trade-partner">Trade with</Label>
            <Select onValueChange={setTradePartnerId} value={tradePartnerId}>
              <SelectTrigger id="trade-partner">
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {otherPlayers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {tradePartnerId && userTeam && (
            <div className="space-y-2">
              <Label>Your Baker to Trade</Label>
              <Select onValueChange={setUserBakerId} value={userBakerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your baker" />
                </SelectTrigger>
                <SelectContent>
                  {userTeam.bakerIds.map(id => {
                    const baker = getBakerById(id, bakers);
                    return baker && <SelectItem key={id} value={id}>{baker.name}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {tradePartnerTeam && (
            <div className="space-y-2">
              <Label>Their Baker to Receive</Label>
              <Select onValueChange={setPartnerBakerId} value={partnerBakerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select their baker" />
                </SelectTrigger>
                <SelectContent>
                  {tradePartnerTeam.bakerIds.map(id => {
                    const baker = getBakerById(id, bakers);
                    return baker && <SelectItem key={id} value={id}>{baker.name}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!userBakerId || !partnerBakerId}>Propose Trade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DropAddFromUnclaimedDialogProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  userTeam?: Team;
  bakers: Baker[];
  bakerToAdd: Baker | null;
  onDropAdd: (bakerToDropId: string) => void;
}

function DropAddFromUnclaimedDialog({ isOpen, setOpen, userTeam, bakers, bakerToAdd, onDropAdd }: DropAddFromUnclaimedDialogProps) {
    const [bakerToDropId, setBakerToDropId] = useState<string>('');
    
    const userBakers = userTeam?.bakerIds.map(id => getBakerById(id, bakers)).filter((b): b is Baker => b?.status === 'active');
    
    const handleSubmit = () => {
        if(bakerToDropId) {
            onDropAdd(bakerToDropId);
            setBakerToDropId('');
        }
    }

    React.useEffect(() => {
        if (!isOpen) {
            setBakerToDropId('');
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add {bakerToAdd?.name} to your team?</DialogTitle>
                    <DialogDescription>
                        Your team is full. Select one of your active bakers to drop in exchange for {bakerToAdd?.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Label>Select baker to drop</Label>
                    <RadioGroup onValueChange={setBakerToDropId} value={bakerToDropId}>
                        {userBakers?.map(baker => (
                            <div key={baker.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={baker.id} id={`drop-${baker.id}`} />
                                <Label htmlFor={`drop-${baker.id}`}>{baker.name}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                <DialogFooter>
                     <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                     <Button onClick={handleSubmit} disabled={!bakerToDropId}>Confirm Add &amp; Drop</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
