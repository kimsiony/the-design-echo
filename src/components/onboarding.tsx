
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, CharacterType, characterNames } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const characters: { type: CharacterType; emoji: string; color: string }[] = [
  { type: "sheep", emoji: "🐑", color: "bg-[oklch(0.95_0.03_90)]" },
  { type: "lion", emoji: "🦁", color: "bg-[oklch(0.9_0.14_60)]" },
  { type: "rabbit", emoji: "🐰", color: "bg-[oklch(0.92_0.08_350)]" },
  { type: "explorer", emoji: "🧭", color: "bg-[oklch(0.85_0.12_150)]" },
  { type: "angel", emoji: "👼", color: "bg-[oklch(0.92_0.08_230)]" },
  { type: "knight", emoji: "⚔️", color: "bg-[oklch(0.88_0.08_280)]" },
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterType | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const setUser = useAppStore((state) => state.setUser);

  const handleStart = () => {
    if (!name.trim() || !selectedCharacter) return;

    setUser({
      name: name.trim(),
      character: selectedCharacter,
      level: 1,
      xp: 0,
      stars: 0,
      streak: 0,
      lastReadDate: null,
      completedReadings: [],
      unlockedItems: [],
      createdAt: new Date().toISOString(),
    });

    setShowWelcome(true);
  };

  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center bg-background p-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="mb-6 text-8xl"
          >
            {characters.find((c) => c.type === selectedCharacter)?.emoji}
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-4 text-2xl font-bold text-foreground"
          >
            {name}의 말씀 모험이
            <br />
            시작되었어요!
          </motion.h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="flex justify-center gap-2"
          >
            {["✨", "📖", "⭐"].map((emoji, i) => (
              <motion.span
                key={emoji}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="text-3xl"
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-center px-6 pb-4 pt-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            말씀탐험대
          </h1>
          <p className="text-muted-foreground">매일 말씀과 함께하는 모험</p>
        </motion.div>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 px-6 py-4">
        {[1, 2].map((s) => (
          <motion.div
            key={s}
            className={`h-2 w-16 rounded-full ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col px-6 py-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  안녕! 이름이 뭐야?
                </h2>
                <p className="text-sm text-muted-foreground">
                  별명도 좋아요
                </p>
              </div>

              <div className="mb-8 flex justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-secondary">
                  <span className="text-6xl">👋</span>
                </div>
              </div>

              <div className="mx-auto w-full max-w-sm">
                <Input
                  type="text"
                  placeholder="이름이나 별명을 입력해주세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl border-2 border-border bg-card px-6 text-center text-lg shadow-sm focus:border-primary"
                  maxLength={10}
                />
              </div>

              <div className="mt-auto pb-8 pt-8">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  className="h-14 w-full rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                >
                  다음으로
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              <div className="mb-6 text-center">
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  {name}의 캐릭터를 골라줘!
                </h2>
                <p className="text-sm text-muted-foreground">
                  함께 모험할 친구예요
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4">
                {characters.map((char) => (
                  <motion.button
                    key={char.type}
                    onClick={() => setSelectedCharacter(char.type)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex flex-col items-center rounded-3xl p-4 transition-all ${
                      selectedCharacter === char.type
                        ? `${char.color} ring-4 ring-primary ring-offset-2`
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    <span className="mb-2 text-5xl">{char.emoji}</span>
                    <span className="text-sm font-medium text-foreground">
                      {characterNames[char.type]}
                    </span>
                    {selectedCharacter === char.type && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto flex gap-3 pb-8 pt-8">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="h-14 flex-1 rounded-2xl border-2 text-lg"
                >
                  이전
                </Button>
                <Button
                  onClick={handleStart}
                  disabled={!selectedCharacter}
                  className="h-14 flex-[2] rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                >
                  말씀 모험 시작하기
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
