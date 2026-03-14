import { NoiseRecord } from "@/lib/types";
import { getStatusColor } from "@/lib/analytics";

interface IncidentTableProps {
  records: NoiseRecord[];
}

const IncidentTable = ({ records }: IncidentTableProps) => {
  // Show newest first, limit to 50
  const sorted = [...records].reverse().slice(0, 50);

  return (
    <div className="dashboard-card col-span-full">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Incident History
      </h3>
      <div className="max-h-[320px] overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Time</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Avg dB</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.key} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2 font-mono text-xs">{r.date}</td>
                <td className="px-4 py-2 font-mono text-xs">{r.time}</td>
                <td className="px-4 py-2 font-mono font-semibold">{r.avg_db}</td>
                <td className="px-4 py-2">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      background: `${getStatusColor(r.status)}20`,
                      color: getStatusColor(r.status),
                    }}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentTable;
