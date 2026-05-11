import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Onboarding } from "@/components/onboarding";
import { HomeScreen } from "@/components/home-screen";
import { ProfileSelect } from "@/components/profile-select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "말씀탐험대 - 매일 말씀과 함께하는 모험" },
      {
        name: "description",
        content:
          "어린이를 위한 성경 읽기 앱. 매일 말씀을 읽고 캐릭터와 함께 성장해요!",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const user = useAppStore((state) => state.user);
  const profiles = useAppStore((state) => state.profiles);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl animate-bounce">📖</div>
          <p className="text-muted-foreground">로딩중...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <HomeScreen />;
  }

  if (profiles.length === 0 || creatingNew) {
    return (
      <Onboarding
        onCancel={
          profiles.length > 0 ? () => setCreatingNew(false) : undefined
        }
      />
    );
  }

  return <ProfileSelect onCreateNew={() => setCreatingNew(true)} />;
}
