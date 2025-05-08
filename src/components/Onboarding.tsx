
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import { UserPreferences } from '@/lib/types';
import { useFlowMateStore } from '@/lib/store';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  "welcome",
  "lastPeriod",
  "cycleLength",
  "mode",
  "notifications"
];

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const updatePreferences = useFlowMateStore(state => state.updatePreferences);
  const completeOnboarding = useFlowMateStore(state => state.completeOnboarding);
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    lastPeriodStart: null,
    averageCycleLength: 28,
    averagePeriodLength: 5,
    mode: 'simple',
    notificationsEnabled: false
  });
  const [lastDate, setLastDate] = useState<Date | undefined>(undefined);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = () => {
    // Save preferences and complete onboarding
    updatePreferences(preferences);
    completeOnboarding();
    onComplete();
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 flowmate-gradient flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {steps[currentStep] === "welcome" && (
                  <div className="text-center space-y-4">
                    <h1 className="text-2xl font-medium">Welcome to FlowMate</h1>
                    <p className="text-muted-foreground">We care about your cycle.</p>
                    <div className="py-8 flex justify-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-flowmate-pink to-flowmate-purple rounded-full flex items-center justify-center">
                        <span className="text-4xl">💖</span>
                      </div>
                    </div>
                    <p>Let's set up your personal tracker with a few simple questions.</p>
                  </div>
                )}

                {steps[currentStep] === "lastPeriod" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium">When did your last period start?</h2>
                    <p className="text-muted-foreground">This helps us predict your next cycle.</p>
                    
                    <div className="flex justify-center py-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !lastDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {lastDate ? format(lastDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto">
                          <Calendar
                            mode="single"
                            selected={lastDate}
                            onSelect={(date) => {
                              setLastDate(date);
                              if (date) {
                                updatePreference('lastPeriodStart', date.toISOString());
                              }
                            }}
                            initialFocus
                            className="p-3"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {steps[currentStep] === "cycleLength" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium">Your cycle details</h2>
                    
                    <div className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm">Average Cycle Length</label>
                          <span className="text-sm font-medium">{preferences.averageCycleLength} days</span>
                        </div>
                        <Slider 
                          value={[preferences.averageCycleLength || 28]} 
                          min={21} 
                          max={45} 
                          step={1}
                          onValueChange={(value) => updatePreference('averageCycleLength', value[0])} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm">Average Period Duration</label>
                          <span className="text-sm font-medium">{preferences.averagePeriodLength} days</span>
                        </div>
                        <Slider 
                          value={[preferences.averagePeriodLength || 5]} 
                          min={2} 
                          max={10} 
                          step={1}
                          onValueChange={(value) => updatePreference('averagePeriodLength', value[0])} 
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {steps[currentStep] === "mode" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium">Choose your experience</h2>
                    <p className="text-muted-foreground">Select the mode that works best for you.</p>
                    
                    <div className="grid grid-cols-1 gap-4 pt-4">
                      <button
                        className={`p-4 rounded-xl border-2 text-left ${
                          preferences.mode === 'simple' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => updatePreference('mode', 'simple')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <span className="text-xl">✨</span>
                          </div>
                          <div>
                            <h3 className="font-medium">Simple Mode</h3>
                            <p className="text-sm text-muted-foreground">Just the essentials for tracking your cycle</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`p-4 rounded-xl border-2 text-left ${
                          preferences.mode === 'full' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => updatePreference('mode', 'full')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <span className="text-xl">📊</span>
                          </div>
                          <div>
                            <h3 className="font-medium">Full Mode</h3>
                            <p className="text-sm text-muted-foreground">Detailed tracking with insights and predictions</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {steps[currentStep] === "notifications" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium">Notifications</h2>
                    <p className="text-muted-foreground">Would you like to receive gentle reminders?</p>
                    
                    <div className="grid grid-cols-1 gap-4 pt-4">
                      <button
                        className={`p-4 rounded-xl border-2 text-left ${
                          preferences.notificationsEnabled ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => updatePreference('notificationsEnabled', true)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <span className="text-xl">🔔</span>
                          </div>
                          <div>
                            <h3 className="font-medium">Enable Notifications</h3>
                            <p className="text-sm text-muted-foreground">Get reminders for upcoming periods and fertile windows</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`p-4 rounded-xl border-2 text-left ${
                          preferences.notificationsEnabled === false ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => updatePreference('notificationsEnabled', false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <span className="text-xl">🔕</span>
                          </div>
                          <div>
                            <h3 className="font-medium">No Notifications</h3>
                            <p className="text-sm text-muted-foreground">Skip notifications for now (you can enable later)</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              {currentStep > 0 ? (
                <Button variant="ghost" onClick={handleBack}>Back</Button>
              ) : (
                <div></div>
              )}
              <Button 
                onClick={handleNext}
                disabled={steps[currentStep] === "lastPeriod" && !lastDate}
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Onboarding;
