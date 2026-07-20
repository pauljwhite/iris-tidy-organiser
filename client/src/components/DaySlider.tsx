interface DaySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function DaySlider({ value, onChange, min = 1, max = 7 }: DaySliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor="days-slider" className="font-medium">
          Cleaning days per week
        </label>
        <span className="text-2xl font-bold text-teal-600 tabular-nums">{value}</span>
      </div>
      <input
        id="days-slider"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
