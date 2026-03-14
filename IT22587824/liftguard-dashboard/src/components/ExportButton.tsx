import { Download } from "lucide-react";
import type { LiftRecord } from "@/services/firebase";
import { exportToCSV } from "@/utils/analytics";

interface ExportButtonProps {
  records: LiftRecord[];
}

const ExportButton = ({ records }: ExportButtonProps) => (
  <button
    onClick={() => exportToCSV(records)}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
  >
    <Download className="w-4 h-4" />
    Export CSV
  </button>
);

export default ExportButton;
