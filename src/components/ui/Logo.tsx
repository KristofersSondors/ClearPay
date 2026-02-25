export function Logo({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-label="ClearPay"
    >
      <div className="w-8 h-8 rounded-lg bg-[#6B5B95] flex items-center justify-center">
        <span className="text-white font-bold text-lg">C</span>
      </div>
      <span className="font-semibold text-gray-900">ClearPay</span>
    </div>
  )
}
