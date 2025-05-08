
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useFlowMateStore } from '@/lib/store';
import { PeriodLog } from '@/lib/types';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { getPeriodLog } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Loader2, CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const flowOptions = [
  { value: 'light', label: 'Light', emoji: '💧' },
  { value: 'medium', label: 'Medium', emoji: '💧💧' },
  { value: 'heavy', label: 'Heavy', emoji: '💧💧💧' },
];

const moodOptions = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😠", label: "Irritable" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤢", label: "Nauseous" },
  { emoji: "😖", label: "Cramps" },
];

const symptomOptions = [
  { id: 'headache', label: 'Headache' },
  { id: 'cramps', label: 'Cramps' },
  { id: 'bloating', label: 'Bloating' },
  { id: 'backache', label: 'Backache' },
  { id: 'tender-breasts', label: 'Tender Breasts' },
  { id: 'acne', label: 'Acne' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'cravings', label: 'Cravings' },
];

const LogPeriod = () => {
  const { activeDay, logs, addLog, updateLog, user } = useFlowMateStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<string>('medium');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [existingLog, setExistingLog] = useState<PeriodLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (activeDay) {
      // Make sure we're using the correct date format with timezone consideration
      const activeDate = new Date(activeDay);
      setSelectedDate(activeDate);
      loadLogData(activeDate.toISOString());
    } else {
      // If no active day is set, use today
      const today = new Date();
      setSelectedDate(today);
      loadLogData(today.toISOString());
    }
  }, [activeDay]);

  const loadLogData = async (dateString: string) => {
    setIsLoading(true);
    
    try {
      // Format date string to ensure consistent date (YYYY-MM-DD) format
      const datePart = dateString.split('T')[0];
      
      // First check local logs
      const localLog = logs.find(log => log.date.startsWith(datePart));
      
      if (localLog) {
        setExistingLog(localLog);
        setSelectedFlow(localLog.flow);
        setSelectedMood(localLog.mood || null);
        setSelectedSymptoms(localLog.symptoms || []);
        setNotes(localLog.notes || '');
      } else if (user) {
        // If not found locally and user is logged in, check database
        const remoteLog = await getPeriodLog(datePart);
        
        if (remoteLog) {
          setExistingLog(remoteLog);
          setSelectedFlow(remoteLog.flow);
          setSelectedMood(remoteLog.mood || null);
          setSelectedSymptoms(remoteLog.symptoms || []);
          setNotes(remoteLog.notes || '');
        } else {
          // No log found anywhere
          resetForm();
        }
      } else {
        resetForm();
      }
    } catch (error) {
      console.error('Error loading log data:', error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not load your previous log entry",
      });
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFlow('medium');
    setSelectedMood(null);
    setSelectedSymptoms([]);
    setNotes('');
    setExistingLog(null);
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      loadLogData(date.toISOString());
      setIsDatePopoverOpen(false);
    }
  };

  const handleSaveLog = () => {
    // Format date as YYYY-MM-DDT00:00:00.000Z to ensure consistent date storage
    // This fixes the date mismatch issue when saving logs
    const dateString = `${selectedDate.toISOString().split('T')[0]}T00:00:00.000Z`;
    
    const logData: PeriodLog = {
      date: dateString,
      flow: selectedFlow as 'light' | 'medium' | 'heavy',
      mood: selectedMood || undefined,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined
    };

    if (existingLog) {
      updateLog(dateString, logData);
    } else {
      addLog(logData);
    }

    toast({
      title: "Log saved",
      description: `Your period data has been recorded for ${format(selectedDate, 'MMMM d, yyyy')}`,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-md mx-auto space-y-4"
    >
      <div className="flex justify-center">
        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              className="flex gap-2 items-center"
            >
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, 'MMMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flow Intensity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2">
            {flowOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedFlow === option.value ? "default" : "outline"}
                className={cn(
                  "flex-1 transition-all",
                  selectedFlow === option.value 
                    ? '' 
                    : 'border-dashed hover:bg-muted/30'
                )}
                onClick={() => setSelectedFlow(option.value)}
              >
                <div className="text-center">
                  <div className="text-lg">{option.emoji}</div>
                  <div className="text-xs mt-1">{option.label}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.label}
                className={cn(
                  "p-2 rounded-full text-center transition-all transform duration-200",
                  selectedMood === mood.emoji ? 
                    'bg-primary/20 scale-110 ring-1 ring-primary' : 
                    'hover:bg-muted hover:scale-105'
                )}
                onClick={() => setSelectedMood(mood.emoji)}
              >
                <span className="text-xl block">{mood.emoji}</span>
                <span className="text-[0.65rem] block mt-1">{mood.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {symptomOptions.map((symptom) => (
              <Button
                key={symptom.id}
                variant={selectedSymptoms.includes(symptom.id) ? "default" : "outline"}
                className={cn(
                  "transition-all",
                  selectedSymptoms.includes(symptom.id) ? '' : 'border-dashed hover:bg-muted/30'
                )}
                onClick={() => handleSymptomToggle(symptom.id)}
              >
                {symptom.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="How are you feeling today? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            onClick={handleSaveLog}
          >
            Save Log
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LogPeriod;
