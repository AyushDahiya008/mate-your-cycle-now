
import { addDays, differenceInDays, format, parseISO, startOfDay } from 'date-fns';
import { CycleStatus, PeriodData, UserPreferences } from './types';

export function getCurrentCycleStatus(periodHistory: PeriodData[], preferences: UserPreferences): CycleStatus {
  const today = startOfDay(new Date());
  
  // Check if currently on period
  const currentPeriod = periodHistory.find(period => {
    if (!period.startDate) return false;
    
    const start = parseISO(period.startDate);
    const end = period.endDate ? parseISO(period.endDate) : addDays(start, preferences.averagePeriodLength);
    
    return today >= start && today <= end;
  });
  
  if (currentPeriod) {
    const dayCount = differenceInDays(today, parseISO(currentPeriod.startDate)) + 1;
    return {
      status: 'period',
      dayCount,
      message: `Day ${dayCount} of your period`
    };
  }
  
  // No active period, calculate where in cycle
  const lastPeriod = [...periodHistory].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  })[0];
  
  if (!lastPeriod) {
    // No period data yet
    return {
      status: 'regular',
      dayCount: 0,
      message: 'Waiting for your first period data'
    };
  }
  
  const lastStart = parseISO(lastPeriod.startDate);
  const daysSinceLastPeriod = differenceInDays(today, lastStart);
  
  if (daysSinceLastPeriod < 0) {
    return {
      status: 'regular',
      dayCount: Math.abs(daysSinceLastPeriod),
      message: `${Math.abs(daysSinceLastPeriod)} days until expected period`
    };
  }
  
  const cycleLength = preferences.averageCycleLength;
  
  // Calculate ovulation (typically cycle length - 14 days)
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 2;
  
  if (daysSinceLastPeriod === ovulationDay) {
    return {
      status: 'ovulation',
      dayCount: daysSinceLastPeriod,
      message: 'Ovulation day'
    };
  }
  
  if (daysSinceLastPeriod >= fertileStart && daysSinceLastPeriod <= fertileEnd) {
    return {
      status: 'fertile',
      dayCount: daysSinceLastPeriod,
      message: 'Fertile window'
    };
  }
  
  // Regular day
  const daysUntilNextPeriod = cycleLength - daysSinceLastPeriod;
  
  if (daysUntilNextPeriod <= 3) {
    return {
      status: 'regular',
      dayCount: daysSinceLastPeriod,
      message: `Period expected in ${daysUntilNextPeriod} day${daysUntilNextPeriod !== 1 ? 's' : ''}`
    };
  }
  
  return {
    status: 'regular',
    dayCount: daysSinceLastPeriod,
    message: `Day ${daysSinceLastPeriod} of your cycle`
  };
}

export function formatDateForDisplay(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
}

export function getDaysInCycle(date: Date, periodHistory: PeriodData[], preferences: UserPreferences): 'period' | 'fertile' | 'ovulation' | 'regular' {
  const targetDate = startOfDay(date);
  
  // Check if date is during a period
  for (const period of periodHistory) {
    const startDate = parseISO(period.startDate);
    const endDate = period.endDate 
      ? parseISO(period.endDate) 
      : addDays(startDate, period.duration || preferences.averagePeriodLength);
    
    if (targetDate >= startDate && targetDate <= endDate) {
      return 'period';
    }
  }
  
  // Find the most recent period that started before the target date
  const previousPeriods = periodHistory
    .filter(p => parseISO(p.startDate) < targetDate)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  if (previousPeriods.length === 0) {
    return 'regular';
  }
  
  const lastPeriod = previousPeriods[0];
  const lastStart = parseISO(lastPeriod.startDate);
  const daysSinceLastPeriod = differenceInDays(targetDate, lastStart);
  const cycleLength = preferences.averageCycleLength;
  
  // Calculate ovulation (typically cycle length - 14 days)
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 2;
  
  if (daysSinceLastPeriod === ovulationDay) {
    return 'ovulation';
  }
  
  if (daysSinceLastPeriod >= fertileStart && daysSinceLastPeriod <= fertileEnd) {
    return 'fertile';
  }
  
  return 'regular';
}

export function getNextPeriodStart(periodHistory: PeriodData[], preferences: UserPreferences): Date | null {
  if (!periodHistory.length && !preferences.lastPeriodStart) {
    return null;
  }
  
  const lastPeriodDate = periodHistory.length 
    ? parseISO(periodHistory[periodHistory.length - 1].startDate)
    : preferences.lastPeriodStart 
      ? parseISO(preferences.lastPeriodStart) 
      : null;
  
  if (!lastPeriodDate) return null;
  
  return addDays(lastPeriodDate, preferences.averageCycleLength);
}
