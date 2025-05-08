
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFlowMateStore } from '@/lib/store';
import { getCurrentCycleStatus, formatDateForDisplay } from '@/lib/periodUtils';
import { Calendar } from '@/components/ui/calendar';

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
    endPeriod 
  } = useFlowMateStore();
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  // Get tip of the day (pseudo-random based on date)
  const todaysTip = tips[new Date().getDate() % tips.length];
  
  // Check if there's an active period
  const activePeriod = periodHistory.find(p => p.endDate === null);
  const cycleStatus = getCurrentCycleStatus(periodHistory, userPreferences);
  
  const handlePeriodToggle = () => {
    const today = new Date().toISOString();
    if (activePeriod) {
      endPeriod(today);
    } else {
      startPeriod(today);
    }
  };
  
  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-2xl font-medium">Hi there!</h1>
        <p className="text-muted-foreground">{cycleStatus.message}</p>
      </motion.div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card className="overflow-hidden border-none shadow-lg">
          <div className={`p-6 text-center ${
            cycleStatus.status === 'period' 
              ? 'bg-flowmate-pink' 
              : cycleStatus.status === 'fertile'
                ? 'bg-flowmate-blue'
                : cycleStatus.status === 'ovulation'
                  ? 'bg-flowmate-purple'
                  : 'bg-flowmate-lavender'
          }`}>
            <Button 
              className={`rounded-full w-32 h-32 text-white border-4 ${
                activePeriod 
                  ? 'bg-rose-500 border-rose-400 hover:bg-rose-600' 
                  : 'bg-primary border-primary/30 hover:bg-primary/90'
              }`}
              onClick={handlePeriodToggle}
            >
              <span className="text-lg font-medium">
                {activePeriod ? 'End Period' : 'Start Period'}
              </span>
            </Button>
          </div>
          
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
                    className={`p-2 rounded-full ${selectedMood === mood.emoji ? 'bg-muted' : 'hover:bg-muted/50'}`}
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
      </motion.div>
      
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
