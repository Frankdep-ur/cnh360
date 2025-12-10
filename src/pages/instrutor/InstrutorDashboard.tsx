import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  TrendingUp, 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  ChevronRight,
  Zap,
  Users,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Ganhos hoje", value: "R$ 240", icon: DollarSign, color: "primary" },
  { label: "Aulas hoje", value: "3", icon: Calendar, color: "secondary" },
  { label: "Avaliação", value: "4.9", icon: Star, color: "amber" },
];

const upcomingLessons = [
  {
    id: 1,
    student: "Maria Santos",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    time: "14:00",
    duration: "1h",
    location: "Av. Brasil, 1234",
    status: "confirmed",
  },
  {
    id: 2,
    student: "João Pedro",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    time: "16:00",
    duration: "2h",
    location: "Rua das Flores, 567",
    status: "pending",
  },
];

const weeklyEarnings = [
  { day: "Seg", value: 240 },
  { day: "Ter", value: 160 },
  { day: "Qua", value: 320 },
  { day: "Qui", value: 80 },
  { day: "Sex", value: 240 },
  { day: "Sáb", value: 160 },
  { day: "Dom", value: 0 },
];

const maxEarning = Math.max(...weeklyEarnings.map((d) => d.value));

export default function InstrutorDashboard() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-secondary text-secondary-foreground px-6 pt-8 pb-20 safe-top">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-secondary-foreground/80 text-sm">Bom dia,</p>
              <h1 className="text-xl font-bold">Carlos Silva 💪</h1>
            </div>
            <button className="w-10 h-10 rounded-xl bg-secondary-foreground/20 flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>

          {/* Premium Banner */}
          <div className="bg-secondary-foreground/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-900" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Seja Premium</p>
              <p className="text-sm text-secondary-foreground/80">Taxa de 18% ao invés de 28%</p>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-6 -mt-12">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-card rounded-2xl p-4 shadow-card text-center"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center",
                    stat.color === "primary" && "bg-primary/10 text-primary",
                    stat.color === "secondary" && "bg-secondary/10 text-secondary",
                    stat.color === "amber" && "bg-amber-100 text-amber-600"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="px-6 mt-6">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Ganhos da semana</h3>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +12%
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyEarnings.map((day, index) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-full rounded-lg transition-all",
                      index === 2 ? "bg-secondary" : "bg-muted"
                    )}
                    style={{ height: `${(day.value / maxEarning) * 100}%`, minHeight: 4 }}
                  />
                  <span className={cn(
                    "text-xs",
                    index === 2 ? "text-secondary font-medium" : "text-muted-foreground"
                  )}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-muted-foreground">Total da semana</span>
              <span className="text-xl font-bold text-foreground">
                R$ {weeklyEarnings.reduce((a, b) => a + b.value, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Lessons */}
      <div className="px-6 mt-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Próximas aulas</h3>
            <Link to="/instrutor/agenda" className="text-sm text-secondary font-medium">
              Ver todas
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={lesson.photo}
                    alt={lesson.student}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{lesson.student}</h4>
                      {lesson.status === "pending" && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Pendente
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.time} ({lesson.duration})
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {lesson.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/instrutor/agenda"
              className="bg-secondary/5 hover:bg-secondary/10 rounded-2xl p-4 transition-colors"
            >
              <Calendar className="w-8 h-8 text-secondary mb-2" />
              <h4 className="font-medium text-foreground">Gerenciar agenda</h4>
              <p className="text-xs text-muted-foreground">Configure horários</p>
            </Link>
            <Link
              to="/instrutor/ganhos"
              className="bg-primary/5 hover:bg-primary/10 rounded-2xl p-4 transition-colors"
            >
              <DollarSign className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium text-foreground">Ver ganhos</h4>
              <p className="text-xs text-muted-foreground">Relatório completo</p>
            </Link>
          </div>
        </div>
      </div>

      <InstructorBottomNav />
    </div>
  );
}
