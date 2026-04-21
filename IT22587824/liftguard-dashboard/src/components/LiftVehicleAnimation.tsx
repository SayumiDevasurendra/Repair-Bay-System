import type { LiftRecord } from "@/services/firebase";

interface LiftVehicleAnimationProps {
  record: LiftRecord | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const ALIGNMENT_UNSAFE_CM = 18;
const TILT_UNSAFE_DEG = 5;

const LiftVehicleAnimation = ({ record }: LiftVehicleAnimationProps) => {
  if (!record) {
    return (
      <div className="card-surface p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Waiting for live vehicle pose...</p>
      </div>
    );
  }

  const baseRollDeg = clamp(record.tiltX, -14, 14);
  const basePitchDeg = clamp(record.tiltY * 0.7, -10, 10);
  const lateralDelta = record.rightDistance - record.leftDistance;
  const baseLateralPx = clamp(lateralDelta * 0.25, -40, 40);
  const alignmentYaw = clamp(record.alignmentDiff * 0.03, -8, 8);
  const unsafe = record.status === "UNSAFE";

  const alignmentSeverity = record.alignmentDiff / ALIGNMENT_UNSAFE_CM;
  const tiltSeverity = Math.max(Math.abs(record.tiltX), Math.abs(record.tiltY)) / TILT_UNSAFE_DEG;

  const unsafeReason = !unsafe
    ? "SAFE"
    : alignmentSeverity >= tiltSeverity
      ? "MISALIGNMENT"
      : "TILT";

  const lateralPx = unsafeReason === "MISALIGNMENT" ? clamp(baseLateralPx * 1.75, -70, 70) : baseLateralPx * 0.55;
  const rollDeg = unsafeReason === "TILT" ? clamp(baseRollDeg * 1.8, -22, 22) : baseRollDeg * 0.55;
  const pitchDeg = unsafeReason === "TILT" ? clamp(basePitchDeg * 1.35, -14, 14) : basePitchDeg * 0.55;

  const sideDirection = lateralPx > 2 ? "RIGHT" : lateralPx < -2 ? "LEFT" : "CENTER";
  const tiltDirection = rollDeg > 1 ? "RIGHT" : rollDeg < -1 ? "LEFT" : "LEVEL";

  return (
    <div className="card-surface p-4 h-full card-accent-cyan">
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">3D Lift Pose Simulation</p>
        <span className={`text-[10px] font-mono ${unsafe ? "status-unsafe-text" : "text-muted-foreground"}`}>
          {unsafe ? unsafeReason : "LIVE"}
        </span>
      </div>

      <div className="relative h-44 rounded-lg overflow-hidden border border-border/60 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.95))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.08),transparent_38%)]" />

        <div className="absolute inset-0 [perspective:900px]">
          <div
            className="absolute left-1/2 bottom-7 w-56 h-20 [transform-style:preserve-3d]"
            style={{
              transform: `translateX(-50%) rotateX(58deg) rotateZ(${alignmentYaw.toFixed(2)}deg)`,
              transition: "transform 340ms ease-out",
            }}
          >
            <div className="absolute inset-0 rounded-md border border-slate-500/50 bg-[linear-gradient(180deg,rgba(100,116,139,0.95),rgba(51,65,85,0.95))] shadow-[inset_0_0_18px_rgba(2,6,23,0.55)]" />
            <div className="absolute left-2 right-2 top-1 h-[2px] rounded-full bg-cyan-100/40" />
          </div>

          <div className="absolute left-1/2 bottom-3 -translate-x-1/2 w-64 h-3 rounded-full bg-slate-800/85" />

          <div className="absolute left-8 bottom-9 w-3 h-28 rounded-sm bg-slate-700/95" />
          <div className="absolute right-8 bottom-9 w-3 h-28 rounded-sm bg-slate-700/95" />

          <div
            className="absolute left-1/2 bottom-10 w-44 h-16 [transform-style:preserve-3d]"
            style={{
              transform: `translateX(calc(-50% + ${lateralPx.toFixed(1)}px)) rotateX(${(-pitchDeg).toFixed(2)}deg) rotateZ(${rollDeg.toFixed(2)}deg) translateZ(24px)`,
              transition: "transform 320ms cubic-bezier(.2,.9,.2,1)",
              filter: unsafe ? "drop-shadow(0 0 18px rgba(248,113,113,0.28))" : "drop-shadow(0 0 16px rgba(34,211,238,0.22))",
            }}
          >
            <div className="absolute left-1 right-1 bottom-5 h-8 rounded-md border border-cyan-200/50 bg-[linear-gradient(180deg,rgba(34,211,238,0.78),rgba(8,145,178,0.9))] shadow-[inset_0_-8px_14px_rgba(12,74,110,0.35)]" />

            <div
              className="absolute left-1 right-1 bottom-2 h-4 rounded-b-md bg-[linear-gradient(180deg,rgba(8,145,178,0.95),rgba(14,116,144,0.98))]"
              style={{ transformOrigin: "top center", transform: "rotateX(-72deg)" }}
            />

            <div className="absolute left-11 right-11 bottom-9 h-5 rounded-t-md rounded-b-sm border border-cyan-100/55 bg-[linear-gradient(180deg,rgba(186,230,253,0.95),rgba(103,232,249,0.55))] shadow-[inset_0_-4px_8px_rgba(12,74,110,0.25)]" />
            <div className="absolute left-14 right-14 bottom-10 h-[2px] rounded-full bg-cyan-50/80" />
            <div className="absolute left-1/2 bottom-9 h-5 w-[2px] -translate-x-1/2 bg-cyan-900/35" />

            <div className="absolute left-2 bottom-7 w-2 h-1 rounded-sm bg-red-300/90" />
            <div className="absolute right-2 bottom-7 w-2 h-1 rounded-sm bg-amber-200/95" />

            <div className="absolute left-7 bottom-0 w-6 h-6 rounded-full border border-slate-500/70 bg-slate-900 shadow-[inset_0_0_0_3px_rgba(2,6,23,0.9)]" />
            <div className="absolute left-[34px] bottom-[10px] w-2 h-2 rounded-full bg-slate-400" />

            <div className="absolute right-7 bottom-0 w-6 h-6 rounded-full border border-slate-500/70 bg-slate-900 shadow-[inset_0_0_0_3px_rgba(2,6,23,0.9)]" />
            <div className="absolute right-[34px] bottom-[10px] w-2 h-2 rounded-full bg-slate-400" />

            <div className="absolute left-6 right-6 bottom-1 h-[2px] rounded-full bg-cyan-50/45" />
          </div>

          {unsafe && unsafeReason === "MISALIGNMENT" && (
            <div className="absolute left-1/2 bottom-[86px] -translate-x-1/2 text-[11px] font-mono status-unsafe-text bg-status-unsafe/20 border border-status-unsafe/40 rounded px-2 py-1">
              POSITION SHIFT: {sideDirection}
            </div>
          )}

          {unsafe && unsafeReason === "TILT" && (
            <div className="absolute left-1/2 bottom-[86px] -translate-x-1/2 text-[11px] font-mono status-unsafe-text bg-status-unsafe/20 border border-status-unsafe/40 rounded px-2 py-1">
              TILT SIDE: {tiltDirection}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground">
        <p>Roll: <span className="text-foreground">{record.tiltX.toFixed(2)}deg</span></p>
        <p>Pitch: <span className="text-foreground">{record.tiltY.toFixed(2)}deg</span></p>
        <p>Shift: <span className="text-foreground">{lateralPx.toFixed(1)}px</span></p>
        <p>Diff: <span className="text-foreground">{record.alignmentDiff.toFixed(2)}cm</span></p>
      </div>
    </div>
  );
};

export default LiftVehicleAnimation;
