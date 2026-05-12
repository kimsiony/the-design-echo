
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

// Map short Korean book codes (used in the reading plan) to full book names.
const bookCodeToName: Record<string, string> = {
  창: "창세기", 출: "출애굽기", 레: "레위기", 민: "민수기", 신: "신명기",
  수: "여호수아", 삿: "사사기", 룻: "룻기", 삼상: "사무엘상", 삼하: "사무엘하",
  왕상: "열왕기상", 왕하: "열왕기하", 대상: "역대상", 대하: "역대하",
  스: "에스라", 느: "느헤미야", 에: "에스더", 욥: "욥기", 시: "시편",
  잠: "잠언", 전: "전도서", 아: "아가", 사: "이사야", 렘: "예레미야",
  애: "예레미야애가", 겔: "에스겔", 단: "다니엘", 호: "호세아", 욜: "요엘",
  암: "아모스", 옵: "오바댜", 욘: "요나", 미: "미가", 나: "나훔",
  합: "하박국", 습: "스바냐", 학: "학개", 슥: "스가랴", 말: "말라기",
  마: "마태복음", 막: "마가복음", 눅: "누가복음", 요: "요한복음",
  행: "사도행전", 롬: "로마서", 고전: "고린도전서", 고후: "고린도후서",
  갈: "갈라디아서", 엡: "에베소서", 빌: "빌립보서", 골: "골로새서",
  살전: "데살로니가전서", 딤전: "디모데전서", 딤후: "디모데후서",
  몬: "빌레몬서", 히: "히브리서",
  약: "야고보서", 벧전: "베드로전서", 벧후: "베드로후서",
  요일: "요한일서", 유: "유다서", 계: "요한계시록",
};

const quizDatabase: Record<string, QuizQuestion[]> = {
  마태복음: [
    { question: "예수님을 찾아온 동방박사가 드린 예물은?", options: ["빵·물·옷", "황금·유향·몰약", "꽃·향·기름", "양·소·비둘기"], correctIndex: 1 },
    { question: "예수님이 광야에서 금식하신 기간은?", options: ["7일", "30일", "40일", "100일"], correctIndex: 2 },
    { question: "산상수훈에서 '마음이 청결한 자'에게 약속된 것은?", options: ["천국", "하나님을 볼 것", "위로받을 것", "땅을 기업"], correctIndex: 1 },
    { question: "주기도문의 첫 마디는?", options: ["거룩하신 하나님", "하늘에 계신 우리 아버지", "주여 구원하소서", "전능하신 주님"], correctIndex: 1 },
    { question: "베드로가 '주는 그리스도시요'라고 고백한 곳은?", options: ["갈릴리", "예루살렘", "가이사랴 빌립보", "베다니"], correctIndex: 2 },
    { question: "예수님이 십자가에 달리신 곳은?", options: ["감람산", "골고다", "시온산", "겟세마네"], correctIndex: 1 },
    { question: "오천 명을 먹이실 때 사용한 것은?", options: ["떡 5개와 물고기 2마리", "떡 7개와 물고기 3마리", "떡 12개", "물고기 5마리"], correctIndex: 0 },
  ],
  마가복음: [
    { question: "마가복음에서 예수님이 자주 쓰신 자기 호칭은?", options: ["메시아", "인자", "선지자", "왕"], correctIndex: 1 },
    { question: "예수님이 처음 부르신 어부 형제는?", options: ["야고보·요한", "베드로·안드레", "마태·도마", "빌립·나다나엘"], correctIndex: 1 },
    { question: "마가복음은 어떤 사건으로 시작되나요?", options: ["예수님 탄생", "세례 요한의 사역", "동방박사 방문", "예수님 족보"], correctIndex: 1 },
    { question: "예수님이 풍랑을 잠잠케 하신 곳은?", options: ["요단강", "갈릴리 바다", "지중해", "사해"], correctIndex: 1 },
  ],
  누가복음: [
    { question: "예수님 탄생을 천사가 알린 사람들은?", options: ["제사장들", "양치는 목자들", "왕과 신하", "어부들"], correctIndex: 1 },
    { question: "탕자의 비유에서 아버지가 돌아온 아들에게 입혀준 것은?", options: ["왕관", "제일 좋은 옷", "갑옷", "흰 두루마리"], correctIndex: 1 },
    { question: "선한 사마리아인이 도와준 사람은 어디로 가던 길이었나요?", options: ["여리고→예루살렘", "예루살렘→여리고", "갈릴리→가나", "벧엘→단"], correctIndex: 1 },
    { question: "삭개오는 무슨 직업이었나요?", options: ["어부", "세리장", "제사장", "목수"], correctIndex: 1 },
  ],
  요한복음: [
    { question: "예수님이 처음으로 행하신 기적은?", options: ["병 고치기", "물을 포도주로 바꾸기", "빵 나누기", "물 위를 걸음"], correctIndex: 1 },
    { question: "'나는 길이요 진리요 생명이니'라고 말씀하신 분은?", options: ["베드로", "바울", "예수님", "모세"], correctIndex: 2 },
    { question: "요한복음 3:16에서 하나님이 주신 것은?", options: ["천사", "독생자", "선지자", "율법"], correctIndex: 1 },
    { question: "예수님과 밤에 만난 바리새인은?", options: ["가야바", "니고데모", "아리마대 요셉", "사울"], correctIndex: 1 },
    { question: "수가성 우물가에서 예수님이 만난 사람은?", options: ["사마리아 여인", "막달라 마리아", "마르다", "안나"], correctIndex: 0 },
  ],
  사도행전: [
    { question: "오순절에 임한 것은?", options: ["바람과 불 같은 성령", "비둘기", "구름", "천둥"], correctIndex: 0 },
    { question: "다메섹 도상에서 예수님을 만난 사람은?", options: ["베드로", "사울(바울)", "스데반", "빌립"], correctIndex: 1 },
    { question: "최초의 순교자는?", options: ["야고보", "스데반", "베드로", "바울"], correctIndex: 1 },
    { question: "베드로가 환상으로 만난 이방인 백부장은?", options: ["고넬료", "유스도", "디모데", "디도"], correctIndex: 0 },
  ],
  로마서: [
    { question: "'의인은 ~로 말미암아 살리라'에서 빈 칸은?", options: ["사랑", "믿음", "행위", "율법"], correctIndex: 1 },
    { question: "'모든 사람이 죄를 범하였으매 하나님의 ~에 이르지 못하더니'", options: ["뜻", "영광", "은혜", "사랑"], correctIndex: 1 },
    { question: "'하나님을 사랑하는 자에게는 ~이 합력하여 선을 이루느니라'", options: ["기도", "모든 것", "말씀", "사람"], correctIndex: 1 },
  ],
  창세기: [
    { question: "하나님이 천지를 창조하신 날은 며칠인가요?", options: ["5일", "6일", "7일", "10일"], correctIndex: 1 },
    { question: "아담과 하와가 먹지 말라고 하신 나무는?", options: ["사과나무", "선악을 알게 하는 나무", "포도나무", "무화과나무"], correctIndex: 1 },
    { question: "노아의 방주에 정결한 동물은 몇 쌍씩 들어갔나요?", options: ["한 쌍", "두 쌍", "일곱 쌍", "열 쌍"], correctIndex: 2 },
    { question: "아브라함이 이삭을 바치려 한 산은?", options: ["시내산", "모리아산", "헤르몬산", "갈멜산"], correctIndex: 1 },
    { question: "야곱이 꿈에서 본 사다리는 어디까지 닿았나요?", options: ["산 꼭대기", "구름", "하늘", "별"], correctIndex: 2 },
  ],
  시편: [
    { question: "시편 23편에서 여호와를 무엇에 비유하나요?", options: ["왕", "목자", "아버지", "친구"], correctIndex: 1 },
    { question: "시편 119편의 주된 주제는?", options: ["하나님의 말씀", "예배", "찬양", "기도"], correctIndex: 0 },
    { question: "'복 있는 사람은 ~의 자리에 앉지 아니하며'", options: ["겸손한", "오만한", "지혜로운", "악인의"], correctIndex: 3 },
  ],
  default: [
    { question: "성경의 첫 번째 책은?", options: ["출애굽기", "창세기", "시편", "마태복음"], correctIndex: 1 },
    { question: "예수님의 열두 제자 중 세금을 걷던 사람은?", options: ["베드로", "요한", "마태", "유다"], correctIndex: 2 },
    { question: "성경에서 가장 긴 장은 어디에 있나요?", options: ["창세기", "시편", "이사야", "요한계시록"], correctIndex: 1 },
    { question: "성경은 모두 몇 권으로 되어 있나요?", options: ["39권", "27권", "66권", "73권"], correctIndex: 2 },
    { question: "신약성경의 첫 번째 책은?", options: ["사도행전", "마태복음", "로마서", "요한계시록"], correctIndex: 1 },
    { question: "구약성경의 마지막 책은?", options: ["말라기", "다니엘", "호세아", "느헤미야"], correctIndex: 0 },
  ],
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickQuestionsForReading(
  reading: BibleReading,
  count: number = 3,
): QuizQuestion[] {
  const fullName = bookCodeToName[reading.book] ?? reading.book;
  const pool = quizDatabase[fullName] ?? quizDatabase["default"];
  const rand = mulberry32(reading.id || 1);
  const indexed = pool.map((q, i) => ({ q, k: rand() + i * 1e-9 }));
  indexed.sort((a, b) => a.k - b.k);
  return indexed.slice(0, Math.min(count, pool.length)).map((x) => x.q);
}

export function QuizScreen({ reading, onBack }: QuizScreenProps) {
  const [questions] = useState(() => pickQuestionsForReading(reading));
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
