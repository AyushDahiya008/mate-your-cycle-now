
import { useState } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useFlowMateStore } from '@/lib/store';
import { getDaysInCycle } from '@/lib/periodUtils';
import { motion } from 'framer-motion';

const CalendarView = () => {
  const { periodHistory, userPreferences, setActiveDay } = useFlowMateStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setActiveDay(date.toISOString());
    }
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
            className="mx-auto"
            modifiers={{
              period: (date) => getDaysInCycle(date, periodHistory, userPreferences) === 'period',
              fertile: (date) => getDaysInCycle(date, periodHistory, userPreferences) === 'fertile',
              ovulation: (date) => getDaysInCycle(date, periodHistory, userPreferences) === 'ovulation',
            }}
            modifiersClassNames={{
              period: 'period-day',
              fertile: 'fertile-day',
              ovulation: 'ovulation-day',
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
              
              <Button 
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={() => setActiveDay(selectedDate.toISOString())}
              >
                Add log for this day
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default CalendarView;
