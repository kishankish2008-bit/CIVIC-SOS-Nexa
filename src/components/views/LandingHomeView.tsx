import React from 'react';
import { motion } from 'motion/react';
import { ScreenView, SampleScenario, AttachedMedia, NexaResult, LocationData } from '../../types';
import { SAMPLE_SCENARIOS } from '../../data/sampleScenarios';
import { UniversalInput } from '../UniversalInput';
import { Pipeline } from '../Pipeline';
import { ScenarioCards } from '../ScenarioCards';
import { ActivityList } from '../ActivityList';
import { GoogleServices } from '../GoogleServices';
import { LiveIntelligencePanel } from '../LiveIntelligencePanel';

interface LandingHomeViewProps {
  onNavigate: (view: ScreenView) => void;
  onSelectScenario: (scenario: SampleScenario) => void;
  onProcessInput: (text: string, media: AttachedMedia[], location?: LocationData) => void;
  isProcessing: boolean;
  history: NexaResult[];
  onSelectResult: (result: NexaResult) => void;
  locationData?: LocationData | null;
  locationStatus?: 'idle' | 'requesting' | 'available' | 'permission_denied' | 'unavailable' | 'stale';
  isLocationTracking?: boolean;
  isVoiceListening?: boolean;
  onSetCustomLocation?: (city: string, country: string, lat: number, lng: number) => void;
}

export const LandingHomeView: React.FC<LandingHomeViewProps> = ({
  onNavigate,
  onSelectScenario,
  onProcessInput,
  isProcessing,
  history,
  onSelectResult,
  locationData,
  locationStatus = 'idle',
  isLocationTracking = false,
  isVoiceListening = false,
  onSetCustomLocation,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
      {/* Real-time Subsystem Status Strip */}
      <LiveIntelligencePanel
        locationStatus={locationStatus}
        isTracking={isLocationTracking}
        isVoiceListening={isVoiceListening}
        activeModel="Gemini 3.8 Flash"
      />

      {/* Hero Header matching reference */}
      <section className="space-y-2 text-left sm:text-left">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Tell <span className="text-blue-600 dark:text-blue-500">NEXA</span> what's happening
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed"
        >
          Give any messy input — text, voice, image, document, or even a real-world situation. NEXA will understand, verify, and give you actionable outcomes.
        </motion.p>
      </section>

      {/* Main Universal Input Intake Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <UniversalInput
          onProcess={onProcessInput}
          isProcessing={isProcessing}
          locationData={locationData}
          onSetCustomLocation={onSetCustomLocation}
          placeholder="Type your request here... (or dictate with Voice, drop photos, or upload PDF/docs)"
        />
      </motion.div>

      {/* 6-Stage AI Pipeline Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Pipeline
          interactive
          onStageClick={() => onNavigate('processing')}
        />
      </motion.div>

      {/* Try a Scenario 4-Card Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <ScenarioCards
          scenarios={SAMPLE_SCENARIOS}
          onSelectScenario={onSelectScenario}
          onViewAll={() => onNavigate('scenarios')}
          maxItems={4}
        />
      </motion.div>

      {/* Bottom 2-Column Grid: Recent Activity & Google Services */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2"
      >
        {/* Left: Recent Activity */}
        <ActivityList
          history={history}
          onSelectResult={onSelectResult}
          onViewHistory={() => onNavigate('history')}
        />

        {/* Right: Powered by Google */}
        <GoogleServices />
      </motion.div>
    </div>
  );
};
