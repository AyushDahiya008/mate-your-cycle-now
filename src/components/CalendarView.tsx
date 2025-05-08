
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useFlowMateStore } from '@/lib/store';
import { getDaysInCycle } from '@/lib/periodUtils';
import { motion } from 'framer-motion';
import { PeriodLog } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';

const CalendarView = () => {
  const { periodHistory, userPreferences, setActiveDay, logs, user } = useFlowMateStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedLog, setSelectedLog] = useState<PeriodLog | null>(null);
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update selected log when the date changes
  useEffect(() => {
    if (selectedDate) {
      loadLogData(selectedDate);
    }
  }, [selectedDate, logs]);

  const loadLogData = async (date: Date) => {
    setIsLoading(true);
    
    try {
      // Format date string to ensure consistent date (YYYY-MM-DD) format
      const datePart = date.toISOString().split('T')[0];
      
      // Check local logs with just the date part (ignoring time)
      const localLog = logs.find(log => log.date.startsWith(datePart));
      
      if (localLog) {
        setSelectedLog(localLog);
      } else {
        setSelectedLog(null);
      }
    } catch (error) {
      console.error('Error loading log data:', error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not load log entry for this date",
      });
      setSelectedLog(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setActiveDay(date.toISOString());
    }
  };

  const getSymptomLabels = (symptomIds: string[]) => {
    const symptomMap: {[key: string]: string} = {
      'headache': 'Headache',
      'cramps': 'Cramps',
      'bloating': 'Bloating',
      'backache': 'Backache',
      'tender-breasts': 'Tender Breasts',
      'acne': 'Acne',
      'fatigue': 'Fatigue',
      'cravings': 'Cravings',
    };
    
    return symptomIds.map(id => symptomMap[id] || id).join(', ');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-md mx-auto space-y-6"
    >
      <h1 className="text-2xl font-medium text-center">Calendar</h1>
      
      <Card className="border-none shadow-lg">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={calendarDate}
            onMonthChange={setCalendarDate}
            className="mx-auto pointer-events-auto"
            modifiers={{
              period: (date) => getDaysInCycle(date, periodHistory, userPreferences) === 'period',
              fertile: (date) => getDaysInCycle(date, periodHistory, userPreferences) === 'fertile',
              ovulation: (date) => getDaysInCycle(date, periodHistory, userPreferences) === 'ovulation',
              hasLog: (date) => {
                const datePart = date.toISOString().split('T')[0];
                return logs.some(log => log.date.startsWith(datePart));
              }
            }}
            modifiersClassNames={{
              period: 'period-day',
              fertile: 'fertile-day',
              ovulation: 'ovulation-day',
              hasLog: 'has-log-day'
            }}
          />
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium">Legend</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-flowmate-pink"></div>
              <span className="text-sm">Period</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-flowmate-blue"></div>
              <span className="text-sm">Fertile Window</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-flowmate-purple"></div>
              <span className="text-sm">Ovulation</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-accent"></div>
              <span className="text-sm">Today</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-4 h-4 rounded-full border border-primary"></div>
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-primary transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              <span className="text-sm">Has Log</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedDate && (
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <h2 className="font-medium mb-2">{format(selectedDate, 'MMMM d, yyyy')}</h2>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <span className="font-medium">
                  {getDaysInCycle(selectedDate, periodHistory, userPreferences) === 'period' 
                    ? 'Period day' 
                    : getDaysInCycle(selectedDate, periodHistory, userPreferences) === 'fertile'
                      ? 'Fertile window'
                      : getDaysInCycle(selectedDate, periodHistory, userPreferences) === 'ovulation'
                        ? 'Ovulation day'
                        : 'Regular day'}
                </span>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : selectedLog ? (
                <div className="space-y-1 mt-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Flow:</span> 
                    <span>{selectedLog.flow === 'light' ? '💧' : selectedLog.flow === 'medium' ? '💧💧' : '💧💧💧'} {selectedLog.flow}</span>
                  </div>
                  
                  {selectedLog.mood && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Mood:</span>
                      <span>{selectedLog.mood}</span>
                    </div>
                  )}
                  
                  {selectedLog.symptoms && selectedLog.symptoms.length > 0 && (
                    <div className="flex gap-1.5">
                      <span className="font-medium">Symptoms:</span>
                      <span>{getSymptomLabels(selectedLog.symptoms)}</span>
                    </div>
                  )}
                  
                  {selectedLog.notes && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-1"
                      onClick={() => setIsLogSheetOpen(true)}
                    >
                      View Notes
                    </Button>
                  )}
                  
                  <div className="pt-1">
                    <Button 
                      size="sm"
                      className="w-full"
                      onClick={() => setActiveDay(selectedDate.toISOString())}
                    >
                      Edit Log
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setActiveDay(selectedDate.toISOString())}
                >
                  Add log for this day
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Sheet for displaying full notes */}
      <Sheet open={isLogSheetOpen} onOpenChange={setIsLogSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notes for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedLog?.notes}
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default CalendarView;
