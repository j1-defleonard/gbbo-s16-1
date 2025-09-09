

import type { Baker, Player, WeeklyLog, League } from '@/lib/types';
import { shuffle } from 'lodash';

export const BAKERS: Omit<Baker, 'data-ai-hint'> & { 'data-ai-hint': string }[] = [
    { id: 'b1', name: 'Aaron', image: 'https://picsum.photos/400/400?random=1', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b2', name: 'Hassan', image: 'https://picsum.photos/400/400?random=2', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b3', name: 'Iain', image: 'https://picsum.photos/400/400?random=3', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b4', name: 'Jasmine', image: 'https://picsum.photos/400/400?random=4', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b5', name: 'Jessika', image: 'https://picsum.photos/400/400?random=5', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b6', name: 'Leighton', image: 'https://picsum.photos/400/400?random=6', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b7', name: 'Lesley', image: 'https://picsum.photos/400/400?random=7', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b8', name: 'Nadia', image: 'https://picsum.photos/400/400?random=8', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b9', name: 'Nataliia', image: 'https://picsum.photos/400/400?random=9', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b10', name: 'Pui Man', image: 'https://picsum.photos/400/400?random=10', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b11', name: 'Toby', image: 'https://picsum.photos/400/400?random=11', 'data-ai-hint': 'baker portrait', status: 'active' },
    { id: 'b12', name: 'Tom', image: 'https://picsum.photos/400/400?random=12', 'data-ai-hint': 'baker portrait', status: 'active' },
];

export const PLAYERS: Player[] = [
  { id: 'p1', name: 'You', isUser: true },
  { id: 'p2', name: 'Mary B.' },
  { id: 'p3', name: 'Paul H.' },
  { id: 'p4', name: 'Noel F.' },
];

export const PAUL_HOLLYWOOD_HANDSHAKE_HISTORY: string[] = [
  'Nadiya Hussain', 'Candice Brown', 'Sophie Faldo', 'Rahul Mandal', 'David Atherton', 'Peter Sawkins', 'Giuseppe Dell\'Anno'
];

const PREVIEW_WEEKLY_LOGS: WeeklyLog[] = [
  {
    week: 1,
    summary: 'Cake Week kicked off the season with a signature drizzle cake, a tricky technical, and a gravity-defying showstopper. While some bakers rose to the occasion, others crumbled under the pressure, leading to the first emotional farewell.',
    events: [
      { bakerId: 'b3', week: 1, type: 'STAR_BAKER' },
      { bakerId: 'b7', week: 1, type: 'WIN_TECHNICAL' },
      { bakerId: 'b1', week: 1, type: 'CRYING' },
      { bakerId: 'b9', week: 1, type: 'LAST_TECHNICAL' },
    ],
    eliminatedBakerId: 'b5',
  },
  {
    week: 2,
    summary: 'Biscuit Week was a snap! The bakers created marshmallow biscuits for the signature, a classic cookie for the technical, and an elaborate biscuit-based board game for the showstopper. A Hollywood Handshake made an early appearance, but one baker\'s game was over.',
    events: [
      { bakerId: 'b1', week: 2, type: 'STAR_BAKER' },
      { bakerId: 'b1', week: 2, type: 'HANDSHAKE' },
      { bakerId: 'b4', week: 2, type: 'WIN_TECHNICAL' },
      { bakerId: 'b2', week: 2, type: 'HELPED_BAKER' },
      { bakerId: 'b8', week: 2, type: 'START_OVER' },
      { bakerId: 'b6', week: 2, type: 'LAST_TECHNICAL' },
    ],
    eliminatedBakerId: 'b10',
  },
];

const PREVIEW_PLAYER_IDS = PLAYERS.map(p => p.id);
const PREVIEW_DRAFT_ORDER = shuffle([...PREVIEW_PLAYER_IDS]);


export const PREVIEW_LEAGUE: League = {
    id: 'preview-league',
    name: 'Bake Off Preview League',
    ownerId: 'p1',
    players: PREVIEW_PLAYER_IDS,
    teams: [
        { playerId: 'p1', bakerIds: ['b1', 'b2', 'b3'] },
        { playerId: 'p2', bakerIds: ['b4', 'b6', 'b7'] },
        { playerId: 'p3', bakerIds: ['b8', 'b9', 'b11'] },
        { playerId: 'p4', bakerIds: ['b12', 'b5', 'b10'] },
    ],
    weeklyLogs: PREVIEW_WEEKLY_LOGS,
    draftState: {
        round: 3,
        currentPlayerIndex: PREVIEW_DRAFT_ORDER.length - 1,
        pickOrder: PREVIEW_DRAFT_ORDER,
        availableBakers: [],
        isDraftComplete: true,
    },
    isPreview: true,
};
