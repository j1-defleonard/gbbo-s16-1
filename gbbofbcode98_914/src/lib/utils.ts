
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Baker, Team, WeeklyEvent, WeeklyLog } from "./types";
import { eventDetails } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBakerScore(bakerId: string, weeklyLogs: WeeklyLog[], allBakers: Baker[]): number {
  let score = 0;
  const baker = getBakerById(bakerId, allBakers);
  if (!baker) return 0;
  
  for (const week of weeklyLogs) {
    for (const event of week.events) {
      if (event.bakerId === bakerId) {
        score += eventDetails[event.type].points;
      }
    }
  }
  return score;
}

export function getTeamScore(team: Team, weeklyLogs: WeeklyLog[], allBakers: Baker[]): number {
  return team.bakerIds.reduce((total, bakerId) => {
    return total + calculateBakerScore(bakerId, weeklyLogs, allBakers);
  }, 0);
}

export function getBakerById(bakerId: string, bakers: Baker[]): Baker | undefined {
  return bakers.find(b => b.id === bakerId);
}
