import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

swipe_hook = """  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.changedTouches[0].screenX; };
    const handleTouchEnd = (e: TouchEvent) => { 
      touchEndX = e.changedTouches[0].screenX; 
      if (touchEndX < touchStartX - 70) {
        if (step === "home" && activeTab === "generate") setActiveTab("restaurants");
      }
      if (touchEndX > touchStartX + 70) {
        if (step === "home" && activeTab === "restaurants") setActiveTab("generate");
      }
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [step, activeTab]);
"""

# Insert swipe hook before `const [savedProfile`
c = c.replace('  const [savedProfile', swipe_hook + '\n  const [savedProfile')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Swipe hook added!")
