
import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore, characterEmojis, characterNames, CharacterType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CharacterCustomizationProps {
  onBack: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  category: "accessory" | "pet" | "background";
}

const shopItems: ShopItem[] = [
  // Accessories
  { id: "crown", name: "왕관", emoji: "👑", cost: 50, category: "accessory" },
  { id: "halo", name: "천사 고리", emoji: "😇", cost: 40, category: "accessory" },
  { id: "hat", name: "모자", emoji: "🎩", cost: 30, category: "accessory" },
  { id: "bow", name: "리본", emoji: "🎀", cost: 25, category: "accessory" },
  { id: "glasses", name: "안경", emoji: "👓", cost: 20, category: "accessory" },
  { id: "wings", name: "날개", emoji: "🪽", cost: 80, category: "accessory" },
  
  // Pets
  { id: "dove", name: "비둘기", emoji: "🕊️", cost: 60, category: "pet" },
  { id: "fish", name: "물고기", emoji: "🐟", cost: 35, category: "pet" },
  { id: "lamb", name: "어린양", emoji: "🐑", cost: 70, category: "pet" },
  { id: "butterfly", name: "나비", emoji: "🦋", cost: 45, category: "pet" },
  
  // Backgrounds
  { id: "rainbow", name: "무지개", emoji: "🌈", cost: 100, category: "background" },
  { id: "stars", name: "별빛", emoji: "✨", cost: 55, category: "background" },
  { id: "garden", name: "정원", emoji: "🌸", cost: 65, category: "background" },
  { id: "clouds", name: "구름", emoji: "☁️", cost: 40, category: "background" },
];

const characters: { type: CharacterType; emoji: string }[] = [
  { type: "sheep", emoji: "🐑" },
  { type: "lion", emoji: "🦁" },
  { type: "rabbit", emoji: "🐰" },
  { type: "explorer", emoji: "🧭" },
  { type: "angel", emoji: "👼" },
  { type: "knight", emoji: "⚔️" },
];

export function CharacterCustomization({ onBack }: CharacterCustomizationProps) {
  const user = useAppStore((state) => state.user);
  const updateUser = useAppStore((state) => state.updateUser);
  const unlockItem = useAppStore((state) => state.unlockItem);
  const [selectedCategory, setSelectedCategory] = useState<"character" | "accessory" | "pet" | "background">("character");
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  if (!user) return null;

  const filteredItems = selectedCategory === "character" 
    ? [] 
    : shopItems.filter((item) => item.category === selectedCategory);

  const handlePurchase = (item: ShopItem) => {
    if (user.unlockedItems.includes(item.id)) return;
    
    if (user.stars >= item.cost) {
      updateUser({ stars: user.stars - item.cost });
      unlockItem(item.id);
      setPurchaseMessage(`${item.name}을(를) 획득했어요!`);
      setTimeout(() => setPurchaseMessage(null), 2000);
    } else {
      setPurchaseMessage("별이 부족해요!");
      setTimeout(() => setPurchaseMessage(null), 2000);
    }
  };

  const handleChangeCharacter = (type: CharacterType) => {
    updateUser({ character: type });
  };

  const getEquippedItems = () => {
    return shopItems.filter((item) => user.unlockedItems.includes(item.id));
  };

  const equippedItems = getEquippedItems();

  return (
    <div className="flex min-h-screen flex-col bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-xl shadow-sm"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-foreground">캐릭터 꾸미기</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
            <span className="text-sm font-medium text-[oklch(0.8_0.15_60)]">
              {user.stars} ⭐
            </span>
          </div>
        </div>
      </header>

      {/* Purchase Message */}
      {purchaseMessage && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed left-0 right-0 top-20 z-50 mx-auto w-fit rounded-full bg-success px-6 py-2 text-success-foreground shadow-lg"
        >
          {purchaseMessage}
        </motion.div>
      )}

      <main className="flex-1 space-y-4 px-5 py-4">
        {/* Character Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card className="overflow-hidden rounded-3xl border-0 bg-card p-6 shadow-lg">
            <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
              {/* Background decoration */}
              {equippedItems.filter(i => i.category === "background").map((item) => (
                <span key={item.id} className="absolute -right-2 -top-2 text-4xl">
                  {item.emoji}
                </span>
              ))}
              
              {/* Character */}
              <div className="relative">
                {/* Accessories */}
                {equippedItems.filter(i => i.category === "accessory").slice(0, 1).map((item) => (
                  <span key={item.id} className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">
                    {item.emoji}
                  </span>
                ))}
                
                <span className="text-8xl">{characterEmojis[user.character]}</span>
                
                {/* Pet */}
                {equippedItems.filter(i => i.category === "pet").slice(0, 1).map((item) => (
                  <span key={item.id} className="absolute -bottom-2 -right-4 text-3xl">
                    {item.emoji}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                Lv.{user.level} {characterNames[user.character]}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {[
            { id: "character", label: "캐릭터", emoji: "🎭" },
            { id: "accessory", label: "악세서리", emoji: "👑" },
            { id: "pet", label: "펫", emoji: "🐾" },
            { id: "background", label: "배경", emoji: "🌈" },
          ].map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className={`flex-shrink-0 gap-2 rounded-full ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </Button>
          ))}
        </motion.div>

        {/* Character Selection */}
        {selectedCategory === "character" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-3xl border-0 bg-card p-5 shadow-lg">
              <h3 className="mb-4 text-center text-sm font-medium text-muted-foreground">
                캐릭터 선택
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {characters.map((char) => (
                  <motion.button
                    key={char.type}
                    onClick={() => handleChangeCharacter(char.type)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center rounded-2xl p-4 transition-all ${
                      user.character === char.type
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-muted hover:bg-secondary"
                    }`}
                  >
                    <span className="mb-1 text-4xl">{char.emoji}</span>
                    <span className="text-xs font-medium text-foreground">
                      {characterNames[char.type]}
                    </span>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Shop Items */}
        {selectedCategory !== "character" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {filteredItems.map((item) => {
              const isOwned = user.unlockedItems.includes(item.id);
              const canAfford = user.stars >= item.cost;

              return (
                <Card
                  key={item.id}
                  className={`relative rounded-2xl border-0 p-4 shadow-sm ${
                    isOwned ? "bg-success/10" : "bg-card"
                  }`}
                >
                  <div className="mb-2 text-center text-4xl">{item.emoji}</div>
                  <h4 className="text-center text-sm font-medium text-foreground">
                    {item.name}
                  </h4>
                  
                  {isOwned ? (
                    <div className="mt-2 rounded-full bg-success py-1 text-center text-xs font-medium text-success-foreground">
                      보유중
                    </div>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford}
                      className={`mt-2 h-8 w-full rounded-full text-xs ${
                        canAfford
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.cost} ⭐
                    </Button>
                  )}
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* Owned Items Summary */}
        {equippedItems.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-2xl border-0 bg-secondary/50 p-4 shadow-sm">
              <h4 className="mb-2 text-center text-sm font-medium text-muted-foreground">
                보유한 아이템
              </h4>
              <div className="flex flex-wrap justify-center gap-2">
                {equippedItems.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-card px-3 py-1 text-sm"
                  >
                    {item.emoji} {item.name}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
