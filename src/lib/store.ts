
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FlowMateState, UserPreferences, PeriodLog } from './types';

const defaultPreferences: UserPreferences = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: null,
  notificationsEnabled: false,
  theme: 'light',
  privacyLockEnabled: false,
  mode: 'simple',
};

export const useFlowMateStore = create<FlowMateState>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      userPreferences: defaultPreferences,
      periodHistory: [],
      logs: [],
      currentView: 'dashboard',
      activeDay: null,
      
      completeOnboarding: () => set({ onboardingComplete: true }),
      
      updatePreferences: (preferences: Partial<UserPreferences>) => set(state => ({
        userPreferences: { ...state.userPreferences, ...preferences }
      })),
      
      startPeriod: (date: string) => set(state => {
        // Check if there's an active period
        const activePeriodIndex = state.periodHistory.findIndex(p => p.endDate === null);
        
        if (activePeriodIndex >= 0) {
          // There's an active period, we should end it first
          const updatedHistory = [...state.periodHistory];
          updatedHistory[activePeriodIndex] = {
            ...updatedHistory[activePeriodIndex],
            endDate: new Date(date).toISOString(),
          };
          return { periodHistory: updatedHistory };
        }
        
        // Start a new period
        return {
          periodHistory: [
            ...state.periodHistory,
            {
              id: Date.now().toString(),
              startDate: new Date(date).toISOString(),
              endDate: null,
            }
          ]
        };
      }),
      
      endPeriod: (date: string) => set(state => {
        const activePeriodIndex = state.periodHistory.findIndex(p => p.endDate === null);
        
        if (activePeriodIndex >= 0) {
          // End the active period
          const updatedHistory = [...state.periodHistory];
          updatedHistory[activePeriodIndex] = {
            ...updatedHistory[activePeriodIndex],
            endDate: new Date(date).toISOString(),
          };
          return { periodHistory: updatedHistory };
        }
        
        return state;
      }),
      
      setCurrentView: (view: FlowMateState['currentView']) => set({ currentView: view }),
      
      setActiveDay: (day: string | null) => set({ activeDay: day }),
      
      addLog: (log: PeriodLog) => set(state => ({
        logs: [...state.logs, log]
      })),
      
      updateLog: (date: string, data: Partial<PeriodLog>) => set(state => {
        const logIndex = state.logs.findIndex(l => l.date === date);
        
        if (logIndex >= 0) {
          const updatedLogs = [...state.logs];
          updatedLogs[logIndex] = { ...updatedLogs[logIndex], ...data };
          return { logs: updatedLogs };
        }
        
        return state;
      })
    }),
    {
      name: 'flowmate-storage',
      skipHydration: true,
    }
  )
);
