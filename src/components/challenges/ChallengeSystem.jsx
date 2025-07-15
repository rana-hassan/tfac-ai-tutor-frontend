import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  Users, 
  Trophy, 
  Target,
  Calendar,
  Flame,
  Award,
  Star,
  Gift
} from 'lucide-react';

export default function ChallengeSystem() {
  const [challenges, setChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const allChallenges = await Challenge.list('-created_date');
      const now = new Date();
      
      const active = allChallenges.filter(c => 
        c.is_active && new Date(c.start_date) <= now && new Date(c.end_date) >= now
      );
      
      const completed = []; // This would come from user's challenge history
      
      setChallenges(allChallenges);
      setActiveChallenges(active);
      setCompletedChallenges(completed);
      
      // Mock user progress for active challenges
      const progress = {};
      active.forEach(challenge => {
        progress[challenge.id] = {
          progress: Math.floor(Math.random() * 100),
          isParticipating: Math.random() > 0.5
        };
      });
      setUserProgress(progress);
      
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge && (!challenge.max_participants || challenge.participants < challenge.max_participants)) {
        await Challenge.update(challengeId, {
          participants: challenge.participants + 1
        });
        
        setUserProgress(prev => ({
          ...prev,
          [challengeId]: { progress: 0, isParticipating: true }
        }));
        
        // Update local state
        setChallenges(prev => prev.map(c => 
          c.id === challengeId ? { ...c, participants: c.participants + 1 } : c
        ));
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
      expert: 'bg-purple-100 text-purple-800'
    };
    return colors[difficulty] || colors.easy;
  };

  const getTypeIcon = (type) => {
    const icons = {
      daily: Clock,
      weekly: Calendar,
      monthly: Target,
      special: Star
    };
    return icons[type] || Clock;
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading challenges...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Learning Challenges</h2>
          <p className="text-slate-600">Test your skills and compete with others</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {activeChallenges.length} Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {completedChallenges.length} Completed
          </Badge>
        </div>
      </div>

      {/* Featured Challenge */}
      {activeChallenges.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5" />
                  <Badge className="bg-white/20 text-white border-white/30">Featured</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">{activeChallenges[0].title}</h3>
                <p className="text-white/90 mb-4">{activeChallenges[0].description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {activeChallenges[0].participants} participants
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getTimeRemaining(activeChallenges[0].end_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gift className="w-4 h-4" />
                    {activeChallenges[0].rewards?.xp || 100} XP
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                {userProgress[activeChallenges[0].id]?.isParticipating ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {userProgress[activeChallenges[0].id]?.progress || 0}%
                    </div>
                    <Progress 
                      value={userProgress[activeChallenges[0].id]?.progress || 0} 
                      className="w-32 h-2 bg-white/20"
                    />
                  </div>
                ) : (
                  <Button 
                    onClick={() => joinChallenge(activeChallenges[0].id)}
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    Join Challenge
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Challenges Grid */}
      {activeChallenges.length > 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Active Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeChallenges.slice(1).map(challenge => {
              const TypeIcon = getTypeIcon(challenge.type);
              const isParticipating = userProgress[challenge.id]?.isParticipating;
              const progress = userProgress[challenge.id]?.progress || 0;
              
              return (
                <motion.div
                  key={challenge.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-5 h-5 text-blue-600" />
                      <Badge variant="outline">{challenge.type}</Badge>
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>

                  <h4 className="text-lg font-semibold text-slate-900 mb-2">{challenge.title}</h4>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{challenge.description}</p>

                  {isParticipating && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Users className="w-4 h-4" />
                        Participants
                      </span>
                      <span className="font-medium">{challenge.participants}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-4 h-4" />
                        Time Left
                      </span>
                      <span className="font-medium">{getTimeRemaining(challenge.end_date)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Award className="w-4 h-4" />
                        Reward
                      </span>
                      <span className="font-medium">{challenge.rewards?.xp || 50} XP</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => joinChallenge(challenge.id)}
                    disabled={isParticipating || (challenge.max_participants && challenge.participants >= challenge.max_participants)}
                    className="w-full"
                    variant={isParticipating ? "outline" : "default"}
                  >
                    {isParticipating ? 'Participating' : 
                     (challenge.max_participants && challenge.participants >= challenge.max_participants) ? 'Full' : 'Join Challenge'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-600" />
              Completed Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedChallenges.map(challenge => (
                <div key={challenge.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{challenge.title}</h4>
                    <p className="text-sm text-slate-600">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    <p className="text-sm text-slate-500 mt-1">+{challenge.rewards?.xp || 50} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeChallenges.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Challenges</h3>
            <p className="text-slate-600">Check back soon for new learning challenges!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}