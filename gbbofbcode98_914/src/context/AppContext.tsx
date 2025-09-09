

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Baker, Player, Team, WeeklyLog, League, DraftState } from '@/lib/types';
import { BAKERS, PLAYERS, PREVIEW_LEAGUE } from '@/lib/data';
import { nanoid } from 'nanoid';
import { shuffle } from 'lodash';

interface AppState {
  bakers: Baker[];
  players: Player[];
  leagues: League[];
  activeLeagueId: string | null;
  setActiveLeagueId: (leagueId: string | null) => void;
  getLeague: (leagueId: string) => League | undefined;
  updateLeague: (leagueId: string, updatedLeague: Partial<League>) => void;
  tradeBakers: (leagueId: string, player1Id: string, baker1Id: string, player2Id: string, baker2Id: string) => void;
  dropAddBakers: (leagueId: string, playerId: string, bakerToDropId: string, bakerToAddId: string) => void;
  addWeeklyLog: (leagueId: string, newLog: WeeklyLog) => void;
  createLeague: (leagueName: string, ownerId: string) => string;
  joinLeague: (leagueId: string, playerId: string) => void;
  handleDraftPick: (leagueId: string, playerId: string, bakerId: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const TOTAL_DRAFT_ROUNDS = 3;
const LEAGUES_STORAGE_KEY = 'gbbo-fantasy-leagues';
const ACTIVE_LEAGUE_ID_STORAGE_KEY = 'gbbo-fantasy-active-league-id';


export function AppProvider({ children }: { children: ReactNode }) {
  const [bakers, setBakers] = useState<Baker[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
        const savedLeagues = localStorage.getItem(LEAGUES_STORAGE_KEY);
        if (savedLeagues) {
            setLeagues(JSON.parse(savedLeagues));
        } else {
            setLeagues([PREVIEW_LEAGUE]);
        }
    } catch (error) {
        console.error("Failed to parse leagues from localStorage", error);
        setLeagues([PREVIEW_LEAGUE]);
    }

    try {
        const savedActiveLeagueId = localStorage.getItem(ACTIVE_LEAGUE_ID_STORAGE_KEY);
        if (savedActiveLeagueId) {
            setActiveLeagueId(JSON.parse(savedActiveLeagueId));
        } else {
            setActiveLeagueId(PREVIEW_LEAGUE.id);
        }
    } catch (error) {
        console.error("Failed to parse active league ID from localStorage", error);
        setActiveLeagueId(PREVIEW_LEAGUE.id);
    }
  }, []);

   // Persist leagues to localStorage whenever they change
   useEffect(() => {
    if (leagues.length > 0) {
        localStorage.setItem(LEAGUES_STORAGE_KEY, JSON.stringify(leagues));
    }
  }, [leagues]);

  // Persist active league ID to localStorage
  useEffect(() => {
    if (activeLeagueId) {
        localStorage.setItem(ACTIVE_LEAGUE_ID_STORAGE_KEY, JSON.stringify(activeLeagueId));
    } else {
        localStorage.removeItem(ACTIVE_LEAGUE_ID_STORAGE_KEY);
    }
  }, [activeLeagueId]);


  useEffect(() => {
    const updatedBakers = BAKERS.map(baker => {
      const isEliminated = PREVIEW_LEAGUE.weeklyLogs.some(log => log.eliminatedBakerId === baker.id);
      return { ...baker, status: isEliminated ? 'eliminated' : 'active' } as Baker;
    });
    setBakers(updatedBakers);
  }, []);
  
  const getLeague = (leagueId: string) => leagues.find(l => l.id === leagueId);

  const updateLeague = (leagueId: string, updatedLeagueData: Partial<League>) => {
    setLeagues(prev => prev.map(l => l.id === leagueId ? { ...l, ...updatedLeagueData } : l));
  };

  const handleDraftPick = (leagueId: string, playerId: string, bakerId: string) => {
    const league = getLeague(leagueId);
    if (!league) return;

    let { draftState, teams } = league;

    if (draftState.isDraftComplete || draftState.pickOrder[draftState.currentPlayerIndex] !== playerId) {
        return;
    }

    const newTeams = teams.map(team => 
        team.playerId === playerId 
            ? { ...team, bakerIds: [...team.bakerIds, bakerId] }
            : team
    );

    const newAvailableBakers = draftState.availableBakers.filter(id => id !== bakerId);

    let nextPlayerIndex = draftState.currentPlayerIndex + 1;
    let currentRound = draftState.round;
    let currentPickOrder = draftState.pickOrder;

    if (nextPlayerIndex >= currentPickOrder.length) {
        currentRound += 1;
        if (currentRound > TOTAL_DRAFT_ROUNDS) {
            updateLeague(leagueId, { teams: newTeams, draftState: { ...draftState, availableBakers: newAvailableBakers, isDraftComplete: true } });
            return;
        }
        nextPlayerIndex = 0;
        currentPickOrder = shuffle(currentPickOrder);
    }
    
    const newDraftState = {
        ...draftState,
        round: currentRound,
        currentPlayerIndex: nextPlayerIndex,
        pickOrder: currentPickOrder,
        availableBakers: newAvailableBakers,
    };

    updateLeague(leagueId, { teams: newTeams, draftState: newDraftState });
  };

  const tradeBakers = (leagueId: string, player1Id: string, baker1Id: string, player2Id: string, baker2Id: string) => {
    const league = getLeague(leagueId);
    if (!league) return;

    const newTeams = JSON.parse(JSON.stringify(league.teams));
    const team1 = newTeams.find((t: Team) => t.playerId === player1Id);
    const team2 = newTeams.find((t: Team) => t.playerId === player2Id);

    if (team1 && team2) {
      team1.bakerIds = team1.bakerIds.filter((id: string) => id !== baker1Id);
      team2.bakerIds = team2.bakerIds.filter((id: string) => id !== baker2Id);
      team1.bakerIds.push(baker2Id);
      team2.bakerIds.push(baker1Id);
      updateLeague(leagueId, { teams: newTeams });
    }
  };

  const dropAddBakers = (leagueId: string, playerId: string, bakerToDropId: string, bakerToAddId: string) => {
    const league = getLeague(leagueId);
    if (!league) return;
    
    const allClaimedBakerIds = new Set(league.teams.flatMap(t => t.bakerIds));
    if (allClaimedBakerIds.has(bakerToAddId)) return; // Baker already claimed

    const newTeams = JSON.parse(JSON.stringify(league.teams));
    const team = newTeams.find((t: Team) => t.playerId === playerId);
    
    if (team) {
      team.bakerIds = team.bakerIds.filter((id: string) => id !== bakerToDropId);
      team.bakerIds.push(bakerToAddId);
      updateLeague(leagueId, { teams: newTeams });
    }
  };
  
  const addWeeklyLog = (leagueId: string, newLog: WeeklyLog) => {
    const league = getLeague(leagueId);
    if (!league) return;

    const existingLogIndex = league.weeklyLogs.findIndex(log => log.week === newLog.week);
    let updatedLogs;
    if (existingLogIndex > -1) {
        updatedLogs = [...league.weeklyLogs];
        updatedLogs[existingLogIndex] = newLog;
    } else {
        updatedLogs = [...league.weeklyLogs, newLog];
    }
    updatedLogs.sort((a,b) => a.week - b.week);
    
    setBakers(currentBakers => {
        return currentBakers.map(baker => {
            const isEliminated = updatedLogs.some(log => log.eliminatedBakerId === baker.id);
            return { ...baker, status: isEliminated ? 'eliminated' : 'active' };
        });
    });
    
    updateLeague(leagueId, { weeklyLogs: updatedLogs });
  }

  const createLeague = (leagueName: string, ownerId: string): string => {
    const leaguePlayers = [ownerId];
    const newLeague: League = {
      id: nanoid(6),
      name: leagueName,
      ownerId,
      players: leaguePlayers,
      teams: leaguePlayers.map(pId => ({playerId: pId, bakerIds: []})),
      weeklyLogs: [],
      draftState: {
        round: 1,
        currentPlayerIndex: 0,
        pickOrder: shuffle(leaguePlayers),
        availableBakers: BAKERS.map(b => b.id),
        isDraftComplete: false,
      },
      isPreview: false,
    };
    setLeagues(currentLeagues => [...currentLeagues, newLeague]);
    return newLeague.id;
  };

  const joinLeague = (leagueId: string, playerId: string) => {
    const league = getLeague(leagueId);
    if (!league || league.players.includes(playerId)) return;
    
    const newPlayers = [...league.players, playerId];
    const newTeam = { playerId: playerId, bakerIds: [] };
    
    const newPickOrder = shuffle(newPlayers);

    updateLeague(leagueId, { 
        players: newPlayers, 
        teams: [...league.teams, newTeam],
        draftState: {
            ...league.draftState,
            pickOrder: newPickOrder,
        }
    });
  };

  const value: AppState = {
    bakers,
    players: PLAYERS,
    leagues,
    activeLeagueId,
    setActiveLeagueId,
    getLeague,
    updateLeague,
    tradeBakers,
    dropAddBakers,
    addWeeklyLog,
    createLeague,
    joinLeague,
    handleDraftPick,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
