import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Brain,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

export default function AnalyticsCharts({ sessions, progress }) {
  // Chart data preparation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySessionData = last7Days.map(date => {
    const daySessions = sessions.filter(session => 
      session.created_date?.startsWith(date)
    );
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      sessions: daySessions.length,
      minutes: daySessions.reduce((sum, s) => sum + s.duration_minutes, 0),
      xp: daySessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0)
    };
  });

  const subjectData = progress.map(p => ({
    name: p.competency_name,
    progress: p.percent_complete,
    sessions: sessions.filter(s => s.subject === p.competency_name).length
  }));

  const difficultyDistribution = [
    { name: 'Beginner', value: sessions.filter(s => s.difficulty_level === 'beginner').length, color: '#10B981' },
    { name: 'Intermediate', value: sessions.filter(s => s.difficulty_level === 'intermediate').length, color: '#F59E0B' },
    { name: 'Advanced', value: sessions.filter(s => s.difficulty_level === 'advanced').length, color: '#EF4444' }
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySessionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#3B82F6" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* XP Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              XP Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySessionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="xp" stroke="#10B981" strokeWidth={2} name="XP Earned" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectData.slice(0, 6).map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {subject.sessions} sessions
                      </Badge>
                      <span className="text-sm text-slate-600">{subject.progress}%</span>
                    </div>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-orange-600" />
              Difficulty Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {difficultyDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}