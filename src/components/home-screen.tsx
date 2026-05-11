
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAppStore,
  characterEmojis,
  XP_PER_LEVEL,
} from "@/lib/store";
import { getTodayReading, getDayOfYear } from "@/lib/bible-schedule";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReadingHistory } from "./reading-history";
import { QuizScreen } from "./quiz-screen";
import { CharacterCustomization } from "./character-customization";

type Screen = "home" | "history" | "quiz" | "customize";

export function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [showCompletionAnim, setShowCompletionAnim] = useState(false);
  const [mounted, setMounted] = useState(false);
  const user = useAppStore((state) => state.user);
  const completeReading = useAppStore((state) => state.completeReading);
  const logout = useAppStore((state) => state.logout);
  const profiles = useAppStore((state) => state.profiles);

  const todayReading = getTodayReading();
  const dayOfYear = getDayOfYear();
  const isCompleted = user?.completedReadings.includes(todayReading.id) ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const xpProgress = (user.xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - (user.xp % XP_PER_LEVEL);

  const handleCompleteReading = () => {
    if (isCompleted) return;
    completeReading(todayReading.id);
    setShowCompletionAnim(true);
    setTimeout(() => setShowCompletionAnim(false), 2500);
  };

  const formatDate = () => {
    const today = new Date();
    return `${today.getMonth() + 1}월 ${today.getDate()}일`;
  };

  if (currentScreen === "history") {
    return <ReadingHistory onBack={() => setCurrentScreen("home")} />;
  }

  if (currentScreen === "quiz") {
    return (
      <QuizScreen
        reading={todayReading}
        onBack={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "customize") {
    return <CharacterCustomization onBack={() => setCurrentScreen("home")} />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background pb-24">
      {/* Completion Animation Overlay */}
      <AnimatePresence>
        {showCompletionAnim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.5 }}
                className="mb-4 text-8xl"
              >
                ✅
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-2 text-2xl font-bold text-foreground"
              >
                말씀 읽기 완료!
              </motion.h2>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-4"
              >
                <span className="text-lg text-warning">+20 XP</span>
                <span className="text-lg text-[oklch(0.8_0.15_60)]">+5 ⭐</span>
              </motion.div>
              {user.streak > 1 && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-2 text-sm text-accent-foreground"
                >
                  연속 {user.streak}일 보너스!
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-6 backdrop-blur-sm">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {user.name}아, 오늘의 말씀을
              <br />
              읽으러 가볼까?
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
            <span className="text-sm font-medium text-[oklch(0.8_0.15_60)]">
              {user.stars} ⭐
            </span>
          </div>
        </motion.div>
        {profiles.length > 1 && (
          <button
            onClick={logout}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            👥 다른 친구로 바꾸기
          </button>
        )}
      </header>

      <main className="flex-1 space-y-4 px-5 py-4">
        {/* Character Status Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-3xl border-0 bg-card p-5 shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary text-5xl">
                  {characterEmojis[user.character]}
                </div>
                <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-primary px-3 py-0.5 text-sm font-bold text-primary-foreground">
                    Lv.{user.level}
                  </span>
                  {user.streak > 0 && (
                    <span className="rounded-full bg-[oklch(0.92_0.14_25)] px-2 py-0.5 text-sm font-medium text-[oklch(0.5_0.15_25)]">
                      🔥 {user.streak}일
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>경험치</span>
                    <span>{xpToNextLevel} XP 남음</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
              </div>
              <a
                href="https://www.bible.com/ko"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <span className="text-xl">📖</span>
                <span>성경 읽으러 가기</span>
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Today's Reading Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={`relative overflow-hidden rounded-3xl border-0 p-5 shadow-lg ${
              isCompleted ? "bg-success/10" : "bg-card"
            }`}
          >
            {isCompleted && (
              <div className="absolute right-4 top-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground"
                >
                  ✓
                </motion.div>
              </div>
            )}
            <div className="mb-1 flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <span className="text-sm font-medium text-muted-foreground">
                {formatDate()}{dayOfYear > 0 ? ` · ${dayOfYear}일차` : ""}
              </span>
            </div>
            <h2 className="mb-1 text-2xl font-bold text-foreground">
              {todayReading.reference}
            </h2>

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleCompleteReading}
                disabled={isCompleted}
                className={`h-12 flex-1 rounded-2xl text-base font-semibold shadow-md transition-all ${
                  isCompleted
                    ? "bg-success/20 text-success-foreground"
                    : "bg-primary text-primary-foreground hover:shadow-lg"
                }`}
              >
                {isCompleted ? "읽기 완료 ✓" : "읽기 완료"}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            onClick={() => setCurrentScreen("quiz")}
            variant="outline"
            className="h-24 flex-col gap-2 rounded-3xl border-2 bg-card text-foreground shadow-sm hover:bg-secondary"
          >
            <span className="text-3xl">❓</span>
            <span className="font-medium">오늘의 퀴즈</span>
          </Button>
          <Button
            onClick={() => setCurrentScreen("history")}
            variant="outline"
            className="h-24 flex-col gap-2 rounded-3xl border-2 bg-card text-foreground shadow-sm hover:bg-secondary"
          >
            <span className="text-3xl">📅</span>
            <span className="font-medium">말씀기록</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => setCurrentScreen("customize")}
            variant="outline"
            className="h-20 w-full flex-row justify-center gap-3 rounded-3xl border-2 bg-card text-foreground shadow-sm hover:bg-secondary"
          >
            <span className="text-3xl">✨</span>
            <span className="font-medium">캐릭터 꾸미기</span>
          </Button>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 px-6 pb-6 pt-3 backdrop-blur-sm">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setCurrentScreen("home")}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium">홈</span>
          </button>
          <button
            onClick={() => setCurrentScreen("history")}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <span className="text-2xl">📖</span>
            <span className="text-xs font-medium">기록</span>
          </button>
          <button
            onClick={() => setCurrentScreen("quiz")}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-medium">퀴즈</span>
          </button>
          <button
            onClick={() => setCurrentScreen("customize")}
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium">캐릭터</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
