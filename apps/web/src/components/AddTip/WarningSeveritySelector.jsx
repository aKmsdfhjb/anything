import { WARNING_SEVERITIES } from "./constants";

export function WarningSeveritySelector({ severity, onChange, category }) {
  if (category !== "avoid" && category !== "safety_warning") {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="text-white font-bold text-sm mb-3 block">
        How serious is this? *
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WARNING_SEVERITIES.map((sev) => {
          const isActive = severity === sev.value;
          return (
            <button
              key={sev.value}
              onClick={() => onChange(sev.value)}
              className="py-3 px-4 rounded-2xl font-bold text-sm transition-all border-2"
              style={{
                borderColor: isActive ? sev.color : "#334155",
                backgroundColor: isActive ? sev.color + "20" : "transparent",
                color: isActive ? sev.color : "#94A3B8",
              }}
            >
              {sev.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
