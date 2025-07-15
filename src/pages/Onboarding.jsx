import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeStep from "../components/onboarding/WelcomeStep";
import SubjectStep from "../components/onboarding/SubjectStep";
import GoalStep from "../components/onboarding/GoalStep";
import VoiceStep from "../components/onboarding/VoiceStep";

export default function OnboardingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const step = urlParams.get('step') || 'welcome';

    const onNext = (nextStep, options) => {
        navigate(createPageUrl(`Onboarding?step=${nextStep}`), options);
    };

    const onComplete = () => {
        navigate(createPageUrl('FirstLesson'));
    };

    const renderStep = () => {
        switch (step) {
            case 'subjects':
                return <SubjectStep onNext={() => onNext('goal')} />;
            case 'goal':
                return <GoalStep onNext={() => onNext('voice')} />;
            case 'voice':
                return <VoiceStep onNext={onComplete} />;
            case 'welcome':
            default:
                return <WelcomeStep onNext={() => onNext('subjects')} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md"
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}