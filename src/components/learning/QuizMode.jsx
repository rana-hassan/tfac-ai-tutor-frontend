import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { InvokeLLM } from '@/api/integrations';
import {
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Target,
  Award,
  RotateCcw
} from 'lucide-react';

export default function QuizMode({ subject, difficulty = 'intermediate', onComplete, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    generateQuizQuestions();
  }, [subject, difficulty]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
  }, [timeLeft, showResult, quizCompleted]);

  const generateQuizQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await InvokeLLM({
        prompt: `Generate 5 multiple choice questions about ${subject} at ${difficulty} level. 
        Each question should have 4 options with only one correct answer.
        Include a brief explanation for each correct answer.`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuestions(response.questions || []);
      setTimeLeft(30);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      // Fallback questions
      setQuestions([
        {
          question: `What is a key concept in ${subject}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 0,
          explanation: 'This is the correct answer based on fundamental principles.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion]?.correct_answer) {
      setScore(score + 1);
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(30);
      } else {
        setQuizCompleted(true);
        const finalScore = selectedAnswer === questions[currentQuestion]?.correct_answer ? score + 1 : score;
        const xpEarned = Math.round((finalScore / questions.length) * 100);
        onComplete && onComplete({
          score: finalScore,
          total: questions.length,
          percentage: Math.round((finalScore / questions.length) * 100),
          xp: xpEarned
        });
      }
    }, 2000);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(30);
    setQuizCompleted(false);
    generateQuizQuestions();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Generating Quiz Questions</h3>
          <p className="text-slate-600">Creating personalized questions for {subject}...</p>
        </CardContent>
      </Card>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const xpEarned = Math.round(percentage * 2);
    
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">{score}/{questions.length}</div>
                <div className="text-sm text-slate-600">Correct Answers</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">{percentage}%</div>
                <div className="text-sm text-slate-600">Accuracy</div>
              </div>
            </div>
            
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              +{xpEarned} XP Earned
            </Badge>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={restartQuiz} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={onClose}>
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">{subject}</Badge>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm text-slate-600 mt-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}/{currentQuestion + (showResult ? 1 : 0)}</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-6">{question?.question}</h3>
              
              <div className="space-y-3">
                {question?.options?.map((option, index) => {
                  let buttonStyle = "border-slate-200 hover:border-slate-300";
                  let icon = null;
                  
                  if (showResult) {
                    if (index === question.correct_answer) {
                      buttonStyle = "border-green-500 bg-green-50 text-green-700";
                      icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                    } else if (index === selectedAnswer && index !== question.correct_answer) {
                      buttonStyle = "border-red-500 bg-red-50 text-red-700";
                      icon = <XCircle className="w-5 h-5 text-red-600" />;
                    }
                  } else if (selectedAnswer === index) {
                    buttonStyle = "border-blue-500 bg-blue-50 text-blue-700";
                  }
                  
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full justify-start h-auto p-4 ${buttonStyle}`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-left">{option}</span>
                        {icon}
                      </div>
                    </Button>
                  );
                })}
              </div>
              
              {showResult && question?.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-start gap-2">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Explanation</h4>
                      <p className="text-blue-800 text-sm">{question.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {!showResult && (
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}