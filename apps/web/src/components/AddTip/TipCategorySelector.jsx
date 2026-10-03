import { TIP_CATEGORIES } from "./constants";

export function TipCategorySelector({ category, onChange }) {
  return (
    <div className="mb-6">
      <label className="text-white font-bold text-sm mb-3 block">
        What kind of tip is this? *
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        {TIP_CATEGORIES.map((cat) => {
          const isActive = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onChange(cat.value)}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all border-2"
              style={{
                borderColor: isActive ? cat.color : "#334155",
                backgroundColor: isActive ? cat.color + "20" : "transparent",
                color: isActive ? cat.color : "#94A3B8",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
