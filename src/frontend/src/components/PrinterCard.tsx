import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";
import { type PrinterStatus, Variant_busy_offline_online } from "../backend.d";
import { PrinterStatusBadge } from "./StatusBadge";

const PRINTER_MODELS: Record<string, string> = {
  "Printer 1": "HP LaserJet",
  "Printer 2": "Canon PIXMA",
  "Printer 3": "Epson EcoTank",
  "Printer 4": "Brother MFC",
};

interface Props {
  name: string;
  status: PrinterStatus;
  jobCount: bigint;
  onPrintHere: () => void;
  index: number;
}

export default function PrinterCard({
  name,
  status,
  jobCount,
  onPrintHere,
  index,
}: Props) {
  const inkLevel = Number(status.inkLevel);
  const isOffline = status.status === Variant_busy_offline_online.offline;
  const model = PRINTER_MODELS[name] ?? name;

  const inkColor =
    inkLevel > 50
      ? "bg-green-500"
      : inkLevel > 20
        ? "bg-amber-500"
        : "bg-red-500";

  const inkTrack =
    inkLevel > 50
      ? "bg-green-100"
      : inkLevel > 20
        ? "bg-amber-100"
        : "bg-red-100";

  return (
    <div
      className={cn(
        "bg-card rounded-xl shadow-card p-4 flex flex-col gap-3 border border-border animate-fade-in transition-shadow hover:shadow-card-hover",
        isOffline && "opacity-70",
      )}
      data-ocid={`printer.card.${index}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              isOffline ? "bg-gray-100" : "bg-teal-50",
            )}
          >
            <Printer
              className={cn(
                "w-5 h-5",
                isOffline ? "text-gray-400" : "text-teal-500",
              )}
            />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">
              {name}
            </p>
            <p className="text-xs text-muted-foreground">{model}</p>
          </div>
        </div>
        <PrinterStatusBadge status={status.status} />
      </div>

      {/* Ink Level */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Ink Level</span>
          <span
            className={cn(
              "text-xs font-semibold",
              inkLevel > 50
                ? "text-green-600"
                : inkLevel > 20
                  ? "text-amber-600"
                  : "text-red-600",
            )}
          >
            {inkLevel}%
          </span>
        </div>
        <div className={cn("h-2 rounded-full overflow-hidden", inkTrack)}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              inkColor,
            )}
            style={{ width: `${inkLevel}%` }}
          />
        </div>
      </div>

      {/* Job Count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Jobs in queue</span>
        <span className="text-xs font-bold text-foreground bg-secondary rounded-full px-2 py-0.5">
          {jobCount.toString()}
        </span>
      </div>

      <Button
        size="sm"
        disabled={isOffline}
        onClick={onPrintHere}
        className={cn(
          "w-full text-xs font-semibold rounded-lg",
          isOffline
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-teal-500 hover:bg-teal-600 text-white",
        )}
        data-ocid={`printer.card.${index}.button`}
      >
        {isOffline ? "Unavailable" : "Print Here"}
      </Button>
    </div>
  );
}
