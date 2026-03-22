import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import { type PrinterStatus, Variant_busy_offline_online } from "../backend.d";
import type { Page } from "../components/Layout";
import PrinterCard from "../components/PrinterCard";
import { useActor } from "../hooks/useActor";
import { useGetAllPrinters } from "../hooks/useQueries";

const MOCK_PRINTERS: [string, PrinterStatus][] = [
  [
    "Printer 1",
    {
      status: Variant_busy_offline_online.online,
      inkLevel: 78n,
      lastJob: undefined,
    },
  ],
  [
    "Printer 2",
    {
      status: Variant_busy_offline_online.busy,
      inkLevel: 35n,
      lastJob: undefined,
    },
  ],
  [
    "Printer 3",
    {
      status: Variant_busy_offline_online.online,
      inkLevel: 92n,
      lastJob: undefined,
    },
  ],
  [
    "Printer 4",
    {
      status: Variant_busy_offline_online.offline,
      inkLevel: 12n,
      lastJob: undefined,
    },
  ],
];

interface Props {
  onNavigate: (page: Page, printerName?: string) => void;
}

export default function DashboardPage({ onNavigate }: Props) {
  const { data: printers, isLoading } = useGetAllPrinters();
  const { actor } = useActor();
  const [jobCounts, setJobCounts] = useState<Record<string, bigint>>({});

  const displayPrinters = useMemo(
    () =>
      (printers && printers.length > 0 ? printers : MOCK_PRINTERS) as [
        string,
        PrinterStatus,
      ][],
    [printers],
  );

  useEffect(() => {
    if (!actor || !displayPrinters.length) return;
    Promise.all(
      displayPrinters.map(async ([name]) => {
        try {
          const count = await actor.getPrinterJobCount(name);
          return [name, count] as [string, bigint];
        } catch {
          return [name, 0n] as [string, bigint];
        }
      }),
    ).then((results) => {
      const map: Record<string, bigint> = {};
      for (const [name, count] of results) map[name] = count;
      setJobCounts(map);
    });
  }, [actor, displayPrinters]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Printers</h1>
        <p className="text-sm text-muted-foreground">
          Live status — refreshes every 30s
        </p>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 gap-3"
          data-ocid="dashboard.loading_state"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-4 space-y-3 border border-border"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {displayPrinters.map(([name, status], i) => (
            <PrinterCard
              key={name}
              name={name}
              status={status}
              jobCount={jobCounts[name] ?? 0n}
              onPrintHere={() => onNavigate("submit", name)}
              index={i + 1}
            />
          ))}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Network Overview
        </h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            {
              label: "Online",
              value: displayPrinters.filter(
                ([, s]) => s.status === Variant_busy_offline_online.online,
              ).length,
              color: "text-green-600",
            },
            {
              label: "Busy",
              value: displayPrinters.filter(
                ([, s]) => s.status === Variant_busy_offline_online.busy,
              ).length,
              color: "text-amber-600",
            },
            {
              label: "Offline",
              value: displayPrinters.filter(
                ([, s]) => s.status === Variant_busy_offline_online.offline,
              ).length,
              color: "text-red-600",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-secondary rounded-lg p-2">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
