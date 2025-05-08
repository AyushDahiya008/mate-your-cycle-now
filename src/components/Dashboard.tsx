
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFlowMateStore } from '@/lib/store';
import { getCurrentCycleStatus, formatDateForDisplay } from '@/lib/periodUtils';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const moodOptions = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😠", label: "Irritable" },
  { emoji: "😴", label: "Tired" }
];

const tips = [
  "Remember to stay hydrated today 💧",
  "Take a moment for self-care today 🧘‍♀️",
  "Track your symptoms for better predictions 📝",
  "A short walk can help with cramps 🚶‍♀️",
  "Warm beverages may ease discomfort 🍵"
];

const Dashboard = () => {
  const { 
    userPreferences, 
    periodHistory, 
    logs,
    startPeriod, 
    endPeriod,
    setUser
  } = useFlowMateStore();
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  // Get tip of the day (pseudo-random based on date)
  const todaysTip = tips[new Date().getDate() % tips.length];
  
  // Check if there's an active period
  const activePeriod = periodHistory.find(p => p.endDate === null);
  const cycleStatus = getCurrentCycleStatus(periodHistory, userPreferences);

  // Find today's mood from logs
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(log => log.date.startsWith(today));
    if (todayLog?.mood) {
      setSelectedMood(todayLog.mood);
    }
  }, [logs]);
  
  const handlePeriodToggle = () => {
    const today = new Date().toISOString();
    if (activePeriod) {
      endPeriod(today);
    } else {
      startPeriod(today);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    toast.success("Logged out successfully");
  };
  
  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-medium">Hi there!</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
      </motion.div>
      
      <p className="text-center text-muted-foreground">{cycleStatus.message}</p>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex justify-center"
      >
        <div className={cn(
          "relative rounded-full p-3 flex items-center justify-center",
          cycleStatus.status === 'period' 
            ? 'bg-flowmate-pink/30' 
            : cycleStatus.status === 'fertile'
              ? 'bg-flowmate-blue/30'
              : cycleStatus.status === 'ovulation'
                ? 'bg-flowmate-purple/30'
                : 'bg-flowmate-lavender/30'
        )}>
          <div className={cn(
            "rounded-full p-3 flex items-center justify-center",
            cycleStatus.status === 'period' 
              ? 'bg-flowmate-pink/50' 
              : cycleStatus.status === 'fertile'
                ? 'bg-flowmate-blue/50'
                : cycleStatus.status === 'ovulation'
                  ? 'bg-flowmate-purple/50'
                  : 'bg-flowmate-lavender/50'
          )}>
            <Button 
              className={cn(
                "rounded-full w-36 h-36 text-white shadow-lg transform transition-all duration-300 hover:scale-105",
                activePeriod 
                  ? 'bg-gradient-to-br from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600' 
                  : 'bg-gradient-to-br from-primary/90 to-primary hover:from-primary hover:to-primary/90'
              )}
              onClick={handlePeriodToggle}
            >
              <span className="text-lg font-medium">
                {activePeriod ? 'End Period' : 'Start Period'}
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
          
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-4">
          {periodHistory.length > 0 && (
            <div className="text-sm text-center mb-4">
              <p>
                {activePeriod 
                  ? `Period started on ${formatDateForDisplay(activePeriod.startDate)}`
                  : periodHistory.length > 0 
                    ? `Last period: ${formatDateForDisplay(periodHistory[periodHistory.length - 1].startDate)}`
                    : "No period data yet"}
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">How are you feeling today?</h3>
            <div className="flex justify-center gap-3">
              {moodOptions.map((mood) => (
                <button 
                  key={mood.label}
                  className={cn(
                    "p-3 rounded-full transition-all transform duration-200",
                    selectedMood === mood.emoji ? 
                      'bg-primary/20 scale-110' : 
                      'hover:bg-muted/50 hover:scale-105'
                  )}
                  onClick={() => setSelectedMood(mood.emoji)}
                >
                  <span className="text-2xl" role="img" aria-label={mood.label}>
                    {mood.emoji}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-4"
      >
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Calendar Preview</h3>
            <Calendar
              mode="single"
              className="rounded-md border p-1"
              classNames={{
                day_selected: "bg-primary text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-bold",
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-flowmate-blue-light">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="text-xl">💡</span>
            </div>
            <p className="text-sm">{todaysTip}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
