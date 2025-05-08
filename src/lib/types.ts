
export interface PeriodData {
  id: string;
  startDate: string; // ISO string
  endDate: string | null; // ISO string, null if period is ongoing
  duration?: number; // in days
  cycleLength?: number; // in days
}

export interface PeriodLog {
  date: string; // ISO string
  flow: 'light' | 'medium' | 'heavy';
  mood?: string; // emoji
  symptoms: string[];
  notes?: string;
}

export interface UserPreferences {
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStart: string | null;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  privacyLockEnabled: boolean;
  mode: 'simple' | 'full';
}

export type FlowMateState = {
  onboardingComplete: boolean;
  userPreferences: UserPreferences;
  periodHistory: PeriodData[];
  logs: PeriodLog[];
  currentView: 'dashboard' | 'calendar' | 'log' | 'insights' | 'settings';
  activeDay: string | null; // ISO string for currently selected day
  
  // Actions
  completeOnboarding: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  startPeriod: (date: string) => void;
  endPeriod: (date: string) => void;
  setCurrentView: (view: FlowMateState['currentView']) => void;
  setActiveDay: (day: string | null) => void;
  addLog: (log: PeriodLog) => void;
  updateLog: (date: string, data: Partial<PeriodLog>) => void;
};

export type CycleStatus = {
  status: 'period' | 'fertile' | 'ovulation' | 'regular';
  dayCount: number; // e.g., "Day 2 of your period"
  message: string;
};
