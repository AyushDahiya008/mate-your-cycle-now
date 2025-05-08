
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FlowMateState, UserPreferences, PeriodLog, AuthUser } from './types';
import { 
  savePeriodLog, 
  getPeriodLogs, 
  savePeriodData,
  getPeriodHistory,
  getCurrentUser
} from './supabase';

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
    (set, get) => ({
      onboardingComplete: false,
      userPreferences: defaultPreferences,
      periodHistory: [],
      logs: [],
      currentView: 'dashboard',
      activeDay: null,
      user: null,
      isLoading: false,
      
      completeOnboarding: () => set({ onboardingComplete: true }),
      
      updatePreferences: (preferences: Partial<UserPreferences>) => set(state => ({
        userPreferences: { ...state.userPreferences, ...preferences }
      })),
      
      startPeriod: async (date: string) => {
        // Check if there's an active period
        const state = get();
        const activePeriodIndex = state.periodHistory.findIndex(p => p.endDate === null);
        
        let updatedHistory = [...state.periodHistory];
        
        if (activePeriodIndex >= 0) {
          // End the active period first
          updatedHistory[activePeriodIndex] = {
            ...updatedHistory[activePeriodIndex],
            endDate: new Date(date).toISOString(),
          };
        }
        
        // Start a new period
        const newPeriod = {
          id: Date.now().toString(),
          startDate: new Date(date).toISOString(),
          endDate: null,
        };
        
        updatedHistory = [...updatedHistory, newPeriod];
        
        // Save to state
        set({ periodHistory: updatedHistory });
        
        // If logged in, save to database
        if (state.user) {
          await savePeriodData(newPeriod);
        }
      },
      
      endPeriod: async (date: string) => {
        const state = get();
        const activePeriodIndex = state.periodHistory.findIndex(p => p.endDate === null);
        
        if (activePeriodIndex >= 0) {
          // End the active period
          const updatedHistory = [...state.periodHistory];
          const updatedPeriod = {
            ...updatedHistory[activePeriodIndex],
            endDate: new Date(date).toISOString(),
          };
          
          updatedHistory[activePeriodIndex] = updatedPeriod;
          
          // Update state
          set({ periodHistory: updatedHistory });
          
          // If logged in, save to database
          if (state.user) {
            await savePeriodData(updatedPeriod);
          }
        }
      },
      
      setCurrentView: (view: FlowMateState['currentView']) => set({ currentView: view }),
      
      setActiveDay: (day: string | null) => set({ activeDay: day }),
      
      addLog: async (log: PeriodLog) => {
        // Update local state
        set(state => ({
          logs: [...state.logs, log]
        }));
        
        // If logged in, save to database
        const state = get();
        if (state.user) {
          await savePeriodLog(log);
        }
      },
      
      updateLog: async (date: string, data: Partial<PeriodLog>) => {
        const state = get();
        const logIndex = state.logs.findIndex(l => l.date === date);
        
        if (logIndex >= 0) {
          const updatedLogs = [...state.logs];
          const updatedLog = { ...updatedLogs[logIndex], ...data };
          updatedLogs[logIndex] = updatedLog;
          
          // Update state
          set({ logs: updatedLogs });
          
          // If logged in, save to database
          if (state.user) {
            await savePeriodLog(updatedLog);
          }
        }
      },
      
      setUser: (user: AuthUser | null) => set({ user }),
      
      syncDataWithSupabase: async () => {
        const state = get();
        if (!state.user) return;
        
        set({ isLoading: true });
        
        try {
          // Sync all period history
          for (const period of state.periodHistory) {
            await savePeriodData(period);
          }
          
          // Sync all logs
          for (const log of state.logs) {
            await savePeriodLog(log);
          }
        } catch (error) {
          console.error('Error syncing data with Supabase:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchUserData: async () => {
        set({ isLoading: true });
        
        try {
          // Check if we're logged in
          const { data: { user } } = await getCurrentUser();
          
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          // Set user in state
          set({ user: { id: user.id, email: user.email } });
          
          // Fetch period history
          const periodHistory = await getPeriodHistory();
          if (periodHistory?.length) {
            set({ periodHistory });
          }
          
          // Fetch logs
          const logs = await getPeriodLogs();
          if (logs?.length) {
            set({ logs });
          }
          
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'flowmate-storage',
      skipHydration: true,
    }
  )
);
