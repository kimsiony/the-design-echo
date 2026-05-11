
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { BibleReading } from "@/lib/bible-schedule";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizScreenProps {
  reading: BibleReading;
  onBack: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// Sample quiz questions based on Bible books
const quizDatabase: Record<string, QuizQuestion[]> = {
  창세기: [
    {
      question: "하나님이 천지를 창조하신 날은 며칠인가요?",
      options: ["5일", "6일", "7일", "10일"],
      correctIndex: 1,
    },
    {
      question: "아담과 하와가 먹지 말라고 한 과일은 무엇인가요?",
      options: ["사과", "선악을 알게 하는 나무 열매", "포도", "배"],
      correctIndex: 1,
    },
    {
      question: "노아의 방주에 동물들은 어떻게 들어갔나요?",
      options: ["한 마리씩", "두 마리씩", "세 마리씩", "다섯 마리씩"],
      correctIndex: 1,
    },
  ],
  마태복음: [
    {
      question: "예수님을 찾아온 동방박사는 몇 명인가요?",
      options: ["2명", "3명", "4명", "성경에 명확히 안 나와요"],
      correctIndex: 3,
    },
    {
      question: "예수님이 광야에서 금식하신 기간은?",
      options: ["7일", "30일", "40일", "100일"],
      correctIndex: 2,
    },
    {
      question: "산상수훈에서 '마음이 청결한 자'에게 약속된 것은?",
      options: ["천국", "하나님을 볼 것", "위로받을 것", "땅을 기업으로 받음"],
      correctIndex: 1,
    },
  ],
  시편: [
    {
      question: "시편 23편에서 여호와를 무엇에 비유하나요?",
      options: ["왕", "목자", "아버지", "친구"],
      correctIndex: 1,
    },
    {
      question: "시편 119편은 무엇에 대한 시편인가요?",
      options: ["하나님의 말씀", "예배", "찬양", "기도"],
      correctIndex: 0,
    },
  ],
  요한복음: [
    {
      question: "예수님이 처음으로 행하신 기적은 무엇인가요?",
      options: ["병 고치기", "물을 포도주로 바꾸기", "빵 나누기", "걷기"],
      correctIndex: 1,
    },
    {
      question: "'나는 길이요 진리요 생명이니'라고 말씀하신 분은?",
      options: ["베드로", "바울", "예수님", "모세"],
      correctIndex: 2,
    },
  ],
  default: [
    {
      question: "성경의 첫 번째 책은 무엇인가요?",
      options: ["출애굽기", "창세기", "시편", "마태복음"],
      correctIndex: 1,
    },
    {
      question: "예수님의 열두 제자 중 세금을 걷던 사람은?",
      options: ["베드로", "요한", "마태", "유다"],
      correctIndex: 2,
    },
    {
      question: "성경에서 가장 긴 장은 어디에 있나요?",
      options: ["창세기", "시편", "이사야", "요한계시록"],
      correctIndex: 1,
    },
  ],
};

function getRandomQuestions(book: string, count: number = 3): QuizQuestion[] {
  const questions = quizDatabase[book] || quizDatabase["default"];
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function QuizScreen({ reading, onBack }: QuizScreenProps) {
  const [questions] = useState(() => getRandomQuestions(reading.book));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const addStars = useAppStore((state) => state.addStars);
  const addXP = useAppStore((state) => state.addXP);
  const saveQuizResult = useAppStore((state) => state.saveQuizResult);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === questions[currentQuestion].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz completed
      const starsEarned = score * 2;
      const xpEarned = score * 10;
      addStars(starsEarned);
      addXP(xpEarned);
      saveQuizResult({
        readingId: reading.id,
        score,
        date: new Date().toISOString(),
      });
      setShowResult(true);
    }
  };

  if (showResult) {
    const starsEarned = score * 2;
    const xpEarned = score * 10;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-xl shadow-sm"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-foreground">퀴즈 결과</h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-5 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-6 text-8xl"
          >
            {percentage >= 80 ? "🏆" : percentage >= 50 ? "👍" : "💪"}
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-2 text-2xl font-bold text-foreground"
          >
            {percentage >= 80
              ? "대단해요!"
              : percentage >= 50
                ? "잘했어요!"
                : "다음엔 더 잘할 수 있어요!"}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-muted-foreground"
          >
            {questions.length}문제 중 {score}문제 정답
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 flex gap-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-[oklch(0.8_0.15_60)]">
                +{starsEarned}
              </p>
              <p className="text-sm text-muted-foreground">별</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">+{xpEarned}</p>
              <p className="text-sm text-muted-foreground">XP</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-sm"
          >
            <Button
              onClick={onBack}
              className="h-14 w-full rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg"
            >
              돌아가기
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctIndex;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-xl shadow-sm"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">오늘의 퀴즈</h1>
            <p className="text-sm text-muted-foreground">{reading.reference}</p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {currentQuestion + 1} / {questions.length}
          </span>
          <span>맞춘 개수: {score}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <main className="flex flex-1 flex-col px-5 py-6">
        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="flex-1"
          >
            <Card className="mb-6 rounded-3xl border-0 bg-card p-6 shadow-lg">
              <div className="mb-4 text-center text-4xl">❓</div>
              <h2 className="text-center text-lg font-semibold text-foreground">
                {question.question}
              </h2>
            </Card>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                let bgClass = "bg-card hover:bg-secondary";
                let textClass = "text-foreground";

                if (isAnswered) {
                  if (index === question.correctIndex) {
                    bgClass = "bg-success";
                    textClass = "text-success-foreground";
                  } else if (index === selectedAnswer) {
                    bgClass = "bg-destructive";
                    textClass = "text-destructive-foreground";
                  }
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={isAnswered}
                    whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                    className={`w-full rounded-2xl border-0 p-5 text-left shadow-sm transition-all ${bgClass} ${textClass}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20 text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{option}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback & Next Button */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6"
            >
              <div
                className={`mb-4 rounded-2xl p-4 text-center ${
                  isCorrect ? "bg-success/20" : "bg-destructive/20"
                }`}
              >
                <p className="text-2xl">{isCorrect ? "🎉" : "😅"}</p>
                <p
                  className={`font-medium ${
                    isCorrect ? "text-success" : "text-destructive"
                  }`}
                >
                  {isCorrect ? "정답이에요!" : "아쉬워요!"}
                </p>
              </div>
              <Button
                onClick={handleNext}
                className="h-14 w-full rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg"
              >
                {currentQuestion < questions.length - 1
                  ? "다음 문제"
                  : "결과 보기"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
