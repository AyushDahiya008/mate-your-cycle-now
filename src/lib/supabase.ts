
import { createClient } from '@supabase/supabase-js';
import { PeriodData, PeriodLog } from './types';

const supabaseUrl = 'https://qkmfsimphdgbtsmjotsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbWZzaW1waGRnYnRzbWpvdHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2ODk4MTAsImV4cCI6MjA2MjI2NTgxMH0.s3hQ_SjsQRGD-Fu6Ke3gBevGYDAuT8KRrmErZL3TlVA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

// Database helpers
export const savePeriodLog = async (log: PeriodLog) => {
  return await supabase.from('period_logs').upsert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    date: log.date,
    flow: log.flow,
    mood: log.mood,
    symptoms: log.symptoms,
    notes: log.notes
  }, { onConflict: 'user_id,date' });
};

export const getPeriodLog = async (date: string) => {
  const { data } = await supabase
    .from('period_logs')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .eq('date', date)
    .single();
  return data as PeriodLog | null;
};

export const getPeriodLogs = async () => {
  const { data } = await supabase
    .from('period_logs')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
  return data as PeriodLog[];
};

export const savePeriodData = async (periodData: PeriodData) => {
  return await supabase.from('period_history').upsert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    id: periodData.id,
    start_date: periodData.startDate,
    end_date: periodData.endDate
  }, { onConflict: 'id' });
};

export const getPeriodHistory = async () => {
  const { data } = await supabase
    .from('period_history')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
  
  // Transform database format to app format
  return data?.map(item => ({
    id: item.id,
    startDate: item.start_date,
    endDate: item.end_date
  })) as PeriodData[];
};
