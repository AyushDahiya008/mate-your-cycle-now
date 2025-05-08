
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useFlowMateStore } from '@/lib/store';
import { PeriodLog } from '@/lib/types';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

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
  const { activeDay, logs, addLog, updateLog } = useFlowMateStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedFlow, setSelectedFlow] = useState<string>('medium');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [existingLog, setExistingLog] = useState<PeriodLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (activeDay) {
      setSelectedDate(parseISO(activeDay));
      
      // Check for existing log
      const foundLog = logs.find(log => log.date === activeDay);
      if (foundLog) {
        setExistingLog(foundLog);
        setSelectedFlow(foundLog.flow);
        setSelectedMood(foundLog.mood || null);
        setSelectedSymptoms(foundLog.symptoms || []);
        setNotes(foundLog.notes || '');
      } else {
        resetForm();
      }
    }
  }, [activeDay, logs]);

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

  const handleSaveLog = () => {
    if (activeDay) {
      const logData: PeriodLog = {
        date: activeDay,
        flow: selectedFlow as 'light' | 'medium' | 'heavy',
        mood: selectedMood || undefined,
        symptoms: selectedSymptoms,
        notes: notes.trim() || undefined
      };

      if (existingLog) {
        updateLog(activeDay, logData);
      } else {
        addLog(logData);
      }

      toast({
        title: "Log saved",
        description: "Your period data has been recorded",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-md mx-auto space-y-4"
    >
      <h1 className="text-2xl font-medium text-center">
        {format(selectedDate, 'MMMM d, yyyy')}
      </h1>
      
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
                className={`flex-1 ${selectedFlow === option.value ? '' : 'border-dashed'}`}
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
                className={`p-2 rounded-full text-center ${
                  selectedMood === mood.emoji 
                    ? 'bg-primary/10 ring-1 ring-primary' 
                    : 'hover:bg-muted'
                }`}
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
                className={selectedSymptoms.includes(symptom.id) ? '' : 'border-dashed'}
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
          <Button className="w-full" onClick={handleSaveLog}>
            Save Log
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LogPeriod;
