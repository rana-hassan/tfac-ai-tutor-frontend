import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User } from '@/api/entities';
import { ArrowRight, Mic, Volume2, CheckCircle } from 'lucide-react';

export default function VoiceStep({ onNext }) {
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  const handleTestVoice = () => {
    // Simulate voice test
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Hello! This is how I sound when reading lessons to you.');
      speechSynthesis.speak(utterance);
    }
    setTestComplete(true);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const currentUser = await User.me();
      await User.updateMyUserData({
        preferences: {
          ...currentUser.preferences,
          ttsEnabled: ttsEnabled,
          onboardingComplete: true,
        }
      });
      onNext();
    } catch (error) {
      console.error('Error saving voice preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Volume2 className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Voice Settings</h2>
        <p className="text-slate-400">Let's test your audio setup</p>
      </div>

      <div className="space-y-6">
        {/* Voice Test */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-slate-400" />
              <span className="font-medium">Test Audio</span>
            </div>
            {testComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
          </div>
          <Button
            onClick={handleTestVoice}
            variant="outline"
            className="w-full"
          >
            {testComplete ? 'Test Again' : 'Test Voice'}
          </Button>
        </div>

        {/* TTS Toggle */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium mb-1">Text-to-Speech</div>
              <div className="text-sm text-slate-400">
                Have lessons read aloud to you
              </div>
            </div>
            <Switch
              checked={ttsEnabled}
              onCheckedChange={setTtsEnabled}
            />
          </div>
        </div>

        <div className="text-center text-sm text-slate-400">
          You can change these settings anytime in your profile.
        </div>
      </div>

      <Button
        onClick={handleComplete}
        disabled={isSaving}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isSaving ? 'Finishing Setup...' : 'Complete Setup'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}