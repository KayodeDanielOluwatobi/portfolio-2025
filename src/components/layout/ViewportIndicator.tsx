// Add this component temporarily during development
export default function ViewportIndicator() {
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-1 text-xs font-mono rounded z-50">
      <span className="sm:hidden">XS (&lt;640px)</span>
      <span className="hidden sm:inline md:hidden">SM (≥640px)</span>
      <span className="hidden md:inline lg:hidden">MD (≥768px)</span>
      <span className="hidden lg:inline xl:hidden">LG (≥1024px)</span>
      <span className="hidden xl:inline 2xl:hidden">XL (≥1280px)</span>
      <span className="hidden 2xl:inline">2XL (≥1536px)</span>
    </div>
  );
}