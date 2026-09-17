import { Package, UserRound, Undo2, SearchCheck, Droplets, Sparkles } from "lucide-react";

const STAGES = [
  { label: "Ready", detail: "On the rack, freshly pressed", icon: Package },
  { label: "Your rental", detail: "With you for the rental window", icon: UserRound },
  { label: "Return", detail: "Pickup or drop-off, no washing needed", icon: Undo2 },
  { label: "Inspection", detail: "Checked for wear and damage", icon: SearchCheck },
  { label: "Laundry", detail: "Professionally cleaned and pressed", icon: Droplets },
  { label: "Ready again", detail: "Back on the rack for the next story", icon: Sparkles },
];

export function GarmentLifecycleStrip() {
  return (
    <div>
      <p className="font-ui text-sm text-brand-navy/60">
        Every LoopWear piece is inspected and professionally cleaned between wears — here&apos;s this garment&apos;s journey.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isCurrent = i === 0;
          return (
            <div key={stage.label} className="flex flex-col items-start gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] ${
                  isCurrent ? "border-brand-cyan bg-brand-cyan/10" : "border-brand-navy/20"
                }`}
              >
                <Icon size={16} strokeWidth={1.5} className={isCurrent ? "text-brand-cyan-deep" : "text-brand-navy/50"} />
              </span>
              <div>
                <p className={`font-ui text-xs font-semibold uppercase tracking-wide ${isCurrent ? "text-brand-navy" : "text-brand-navy/50"}`}>
                  {stage.label}
                </p>
                <p className="mt-0.5 font-ui text-xs text-brand-navy/50">{stage.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
