
import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { getReadingByDate, getDayOfYear, getReadingById } from "@/lib/bible-schedule";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReadingHistoryProps {
  onBack: () => void;
}

const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export function ReadingHistory({ onBack }: ReadingHistoryProps) {
  const user = useAppStore((state) => state.user);
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!user) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate stats
  const completedCount = user.completedReadings.length;
  const currentDayOfYear = getDayOfYear();
  const completionRate = Math.round((completedCount / currentDayOfYear) * 100);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    if (nextDate <= new Date()) {
      setCurrentDate(nextDate);
    }
  };

  const isCurrentMonth =
    month === new Date().getMonth() && year === new Date().getFullYear();

  const getDayStatus = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) return "future";

    const reading = getReadingByDate(date);
    if (user.completedReadings.includes(reading.id)) return "completed";
    if (date < today) return "missed";
    return "today";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-xl shadow-sm"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-foreground">말씀기록</h1>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-5 py-4">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="rounded-2xl border-0 bg-primary/10 p-4 text-center shadow-sm">
            <p className="mb-1 text-2xl font-bold text-primary">
              {completedCount}
            </p>
            <p className="text-xs text-muted-foreground">완료한 말씀</p>
          </Card>
          <Card className="rounded-2xl border-0 bg-success/10 p-4 text-center shadow-sm">
            <p className="mb-1 text-2xl font-bold text-success">
              {user.streak}일
            </p>
            <p className="text-xs text-muted-foreground">연속 읽기</p>
          </Card>
          <Card className="rounded-2xl border-0 bg-warning/10 p-4 text-center shadow-sm">
            <p className="mb-1 text-2xl font-bold text-[oklch(0.7_0.17_80)]">
              {completionRate}%
            </p>
            <p className="text-xs text-muted-foreground">달성률</p>
          </Card>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-3xl border-0 bg-card p-5 shadow-lg">
            {/* Month Navigation */}
            <div className="mb-4 flex items-center justify-between">
              <Button
                onClick={prevMonth}
                variant="ghost"
                className="h-10 w-10 rounded-full p-0"
              >
                ←
              </Button>
              <h2 className="text-lg font-bold text-foreground">
                {year}년 {month + 1}월
              </h2>
              <Button
                onClick={nextMonth}
                variant="ghost"
                disabled={isCurrentMonth}
                className="h-10 w-10 rounded-full p-0"
              >
                →
              </Button>
            </div>

            {/* Day Headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day, i) => (
                <div
                  key={day}
                  className={`py-2 text-center text-sm font-medium ${
                    i === 0 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before first day of month */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const reading = getReadingByDate(new Date(year, month, day));
                const isToday =
                  day === new Date().getDate() && isCurrentMonth;

                return (
                  <motion.div
                    key={day}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                      status === "completed"
                        ? "bg-success text-success-foreground"
                        : status === "missed"
                          ? "bg-muted text-muted-foreground"
                          : status === "today"
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                            : "text-muted-foreground/50"
                    }`}
                    title={reading.reference}
                  >
                    <span className={`font-medium ${isToday ? "font-bold" : ""}`}>
                      {day}
                    </span>
                    {status === "completed" && (
                      <span className="absolute -right-0.5 -top-0.5 text-xs">
                        ✓
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-success" />
                <span>완료</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-muted" />
                <span>미완료</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-primary" />
                <span>오늘</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Readings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-3 text-lg font-bold text-foreground">
            최근 읽은 말씀
          </h3>
          <div className="space-y-2">
            {user.completedReadings
              .slice(-5)
              .reverse()
              .map((readingId) => {
                const reading = getReadingById(readingId);
                if (!reading) return null;
                const readDate = new Date(reading.date);

                return (
                  <Card
                    key={readingId}
                    className="flex items-center gap-3 rounded-2xl border-0 bg-card p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {reading.reference}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {readDate.getMonth() + 1}월 {readDate.getDate()}일
                      </p>
                    </div>
                    <span className="text-lg">📖</span>
                  </Card>
                );
              })}

            {user.completedReadings.length === 0 && (
              <Card className="rounded-2xl border-0 bg-card p-6 text-center shadow-sm">
                <p className="text-3xl">📚</p>
                <p className="mt-2 text-muted-foreground">
                  아직 읽은 말씀이 없어요
                </p>
                <p className="text-sm text-muted-foreground">
                  오늘 첫 말씀을 읽어볼까요?
                </p>
              </Card>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
