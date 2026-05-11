import { motion } from "framer-motion";
import { useAppStore, characterEmojis } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface ProfileSelectProps {
  onCreateNew: () => void;
}

export function ProfileSelect({ onCreateNew }: ProfileSelectProps) {
  const profiles = useAppStore((state) => state.profiles);
  const loginAs = useAppStore((state) => state.loginAs);
  const deleteProfile = useAppStore((state) => state.deleteProfile);

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-12">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-2 text-3xl font-bold text-foreground">말씀탐험대</h1>
        <p className="text-muted-foreground">누가 말씀 모험을 떠날까요?</p>
      </motion.div>

      <div className="flex flex-1 flex-col gap-3">
        {profiles.map((p, i) => (
          <motion.button
            key={p.name}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loginAs(p.name)}
            className="group flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-4xl">
              {characterEmojis[p.character]}
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-foreground">{p.name}</div>
              <div className="text-sm text-muted-foreground">
                Lv.{p.level} · ⭐ {p.stars} · 🔥 {p.streak}일
              </div>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`${p.name} 프로필을 삭제할까요? 모든 기록이 사라져요.`)) {
                  deleteProfile(p.name);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  if (confirm(`${p.name} 프로필을 삭제할까요?`)) {
                    deleteProfile(p.name);
                  }
                }
              }}
              className="rounded-full px-2 py-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              aria-label={`${p.name} 삭제`}
            >
              삭제
            </span>
          </motion.button>
        ))}
      </div>

      <Button
        onClick={onCreateNew}
        className="mt-6 h-14 rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl"
      >
        + 새 친구 추가하기
      </Button>
    </div>
  );
}
