import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/api/entities';
import DynamicIcon from '../layout/DynamicIcon';
import { ArrowRight, Check } from 'lucide-react';

const subjects = [
  { name: 'Mathematics', icon: 'Calculator' },
  { name: 'Science', icon: 'FlaskConical' },
  { name: 'Programming', icon: 'Code2' },
  { name: 'History', icon: 'Globe' },
  { name: 'Literature', icon: 'BookOpen' },
  { name: 'Art', icon: 'Palette' },
];

export default function SubjectStep({ onNext }) {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSubject = (subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleContinue = async () => {
    if (selectedSubjects.length === 0) return;
    
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        preferences: {
          subjects: selectedSubjects,
        }
      });
      onNext();
    } catch (error) {
      console.error('Error saving subjects:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">What would you like to learn?</h2>
        <p className="text-slate-400">Select your areas of interest</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                selectedSubjects.includes(subject.name)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              onClick={() => toggleSubject(subject.name)}
            >
              <CardContent className="p-4 text-center relative">
                {selectedSubjects.includes(subject.name) && (
                  <Check className="absolute top-2 right-2 w-4 h-4" />
                )}
                <DynamicIcon name={subject.icon} className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-medium">{subject.name}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={selectedSubjects.length === 0 || isSaving}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isSaving ? 'Saving...' : 'Continue'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}