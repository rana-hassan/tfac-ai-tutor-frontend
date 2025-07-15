import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyGroup } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Target,
  TrendingUp,
  Crown,
  Calendar,
  BookOpen,
  Zap
} from 'lucide-react';

export default function StudyGroups() {
  const [studyGroups, setStudyGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    difficulty_level: 'beginner',
    max_members: 10,
    is_public: true,
    weekly_goal: 500,
    tags: []
  });

  useEffect(() => {
    loadStudyGroups();
  }, []);

  const loadStudyGroups = async () => {
    try {
      const [allGroups, userGroups] = await Promise.all([
        StudyGroup.list('-created_date'),
        // In a real app, this would filter groups where user is a member
        StudyGroup.filter({ is_public: true })
      ]);
      
      setStudyGroups(allGroups);
      setMyGroups(userGroups.slice(0, 3)); // Mock user groups
    } catch (error) {
      console.error('Error loading study groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createStudyGroup = async () => {
    try {
      const groupData = {
        ...newGroup,
        current_members: 1,
        group_stats: {
          total_xp: 0,
          sessions_completed: 0,
          avg_difficulty: newGroup.difficulty_level
        }
      };

      const createdGroup = await StudyGroup.create(groupData);
      setStudyGroups(prev => [createdGroup, ...prev]);
      setMyGroups(prev => [createdGroup, ...prev]);
      setShowCreateForm(false);
      setNewGroup({
        name: '',
        description: '',
        subject: '',
        difficulty_level: 'beginner',
        max_members: 10,
        is_public: true,
        weekly_goal: 500,
        tags: []
      });
    } catch (error) {
      console.error('Error creating study group:', error);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      // In a real app, this would create a membership record
      const group = studyGroups.find(g => g.id === groupId);
      if (group && group.current_members < group.max_members) {
        await StudyGroup.update(groupId, {
          current_members: group.current_members + 1
        });
        
        setMyGroups(prev => [...prev, group]);
        setStudyGroups(prev => prev.map(g => 
          g.id === groupId 
            ? { ...g, current_members: g.current_members + 1 }
            : g
        ));
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || group.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || group.difficulty_level === filterDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
      mixed: 'bg-purple-100 text-purple-800'
    };
    return colors[difficulty] || colors.beginner;
  };

  const getGroupProgress = (group) => {
    return Math.min((group.group_stats?.total_xp || 0) / group.weekly_goal * 100, 100);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading study groups...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Study Groups</h2>
          <p className="text-slate-600">Learn together with fellow students</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              My Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map(group => (
                <motion.div
                  key={group.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">{group.name}</h4>
                    <Badge className={getDifficultyColor(group.difficulty_level)}>
                      {group.difficulty_level}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{group.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Weekly Goal</span>
                      <span className="font-medium">{group.group_stats?.total_xp || 0}/{group.weekly_goal} XP</span>
                    </div>
                    <Progress value={getGroupProgress(group)} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.current_members}/{group.max_members}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {group.current_streak} day streak
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Languages">Languages</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <Badge variant="outline">{group.subject}</Badge>
              </div>
              <Badge className={getDifficultyColor(group.difficulty_level)}>
                {group.difficulty_level}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-2">{group.name}</h3>
            <p className="text-slate-600 text-sm mb-4 line-clamp-3">{group.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-500">
                  <Users className="w-4 h-4" />
                  Members
                </span>
                <span className="font-medium">
                  {group.current_members}/{group.max_members}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-500">
                  <Target className="w-4 h-4" />
                  Weekly Goal
                </span>
                <span className="font-medium">{group.weekly_goal} XP</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-500">
                  <TrendingUp className="w-4 h-4" />
                  Group Streak
                </span>
                <span className="font-medium">{group.current_streak} days</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button
                onClick={() => joinGroup(group.id)}
                disabled={group.current_members >= group.max_members || myGroups.some(g => g.id === group.id)}
                className="w-full"
                variant={myGroups.some(g => g.id === group.id) ? "outline" : "default"}
              >
                {myGroups.some(g => g.id === group.id) ? 'Joined' : 
                 group.current_members >= group.max_members ? 'Full' : 'Join Group'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create Study Group</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Group Name</label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    placeholder="Describe your group"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      value={newGroup.subject}
                      onChange={(e) => setNewGroup({...newGroup, subject: e.target.value})}
                      placeholder="e.g., Math"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <Select 
                      value={newGroup.difficulty_level} 
                      onValueChange={(value) => setNewGroup({...newGroup, difficulty_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Members</label>
                    <Input
                      type="number"
                      value={newGroup.max_members}
                      onChange={(e) => setNewGroup({...newGroup, max_members: parseInt(e.target.value)})}
                      min="2"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Weekly XP Goal</label>
                    <Input
                      type="number"
                      value={newGroup.weekly_goal}
                      onChange={(e) => setNewGroup({...newGroup, weekly_goal: parseInt(e.target.value)})}
                      min="100"
                      step="50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={createStudyGroup} className="flex-1" disabled={!newGroup.name || !newGroup.subject}>
                  Create Group
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}