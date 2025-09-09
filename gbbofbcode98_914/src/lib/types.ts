

export type Baker = {
  id: string;
  name: string;
  image: string;
  status: 'active' | 'eliminated';
  'data-ai-hint': string;
};

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type Player = {
  id: string;
  name: string;
  isUser?: boolean;
};

export type Team = {
  playerId: string;
  bakerIds: string[];
};

export type EventType = 
  | 'HANDSHAKE' 
  | 'STAR_BAKER' 
  | 'WIN_TECHNICAL'
  | 'HELPED_BAKER'
  | 'CRYING'
  | 'START_OVER'
  | 'LAST_TECHNICAL'
  | 'SEMI_FINAL'
  | 'FINAL'
  | 'WINNER';

export const eventDetails: Record<EventType, { points: number; description: string }> = {
  HANDSHAKE: { points: 5, description: "Handshake from Paul Hollywood" },
  STAR_BAKER: { points: 5, description: "Star Baker" },
  WIN_TECHNICAL: { points: 3, description: "Won the Technical Challenge" },
  HELPED_BAKER: { points: 2, description: "Helped another baker" },
  CRYING: { points: 1, description: "Crying" },
  START_OVER: { points: 1, description: "Started over" },
  LAST_TECHNICAL: { points: -2, description: "Last in the Technical" },
  SEMI_FINAL: { points: 3, description: "Made it to the semi-finals" },
  FINAL: { points: 6, description: "Made it to the final" },
  WINNER: { points: 10, description: "Season Winner" },
};

export type WeeklyEvent = {
  bakerId: string;
  week: number;
  type: EventType;
};

export type WeeklyLog = {
  week: number;
  summary?: string;
  events: WeeklyEvent[];
  eliminatedBakerId: string | null;
}

export type DraftState = {
  round: number;
  currentPlayerIndex: number;
  pickOrder: string[]; // Array of player IDs
  availableBakers: string[]; // Array of baker IDs
  isDraftComplete: boolean;
};

export type League = {
  id: string;
  name: string;
  ownerId: string;
  players: string[]; // list of player IDs
  teams: Team[];
  weeklyLogs: WeeklyLog[];
  draftState: DraftState;
  isPreview?: boolean; 
}
