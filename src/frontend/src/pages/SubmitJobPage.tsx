import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type PrinterStatus, Variant_busy_offline_online } from "../backend.d";
import { useGetAllPrinters, useSubmitPrintJob } from "../hooks/useQueries";

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

const PRIORITIES = [
  {
    value: "1",
    label: "Low",
    desc: "Standard",
    color:
      "bg-gray-100 text-gray-700 border-gray-300 data-[selected=true]:bg-gray-200",
  },
  {
    value: "5",
    label: "Normal",
    desc: "Business",
    color:
      "bg-blue-50 text-blue-700 border-blue-300 data-[selected=true]:bg-blue-100",
  },
  {
    value: "10",
    label: "High",
    desc: "Priority",
    color:
      "bg-orange-50 text-orange-700 border-orange-300 data-[selected=true]:bg-orange-100",
  },
  {
    value: "20",
    label: "Urgent",
    desc: "Rush",
    color:
      "bg-red-50 text-red-700 border-red-300 data-[selected=true]:bg-red-100",
  },
];

interface Props {
  initialPrinter?: string;
}

export default function SubmitJobPage({ initialPrinter }: Props) {
  const { data: printers } = useGetAllPrinters();
  const submitMutation = useSubmitPrintJob();
  const [fileName, setFileName] = useState("");
  const [selectedPrinter, setSelectedPrinter] = useState(initialPrinter ?? "");
  const [priority, setPriority] = useState("5");

  const displayPrinters = (
    printers && printers.length > 0 ? printers : MOCK_PRINTERS
  ) as [string, PrinterStatus][];
  const availablePrinters = displayPrinters.filter(
    ([, s]) => s.status !== Variant_busy_offline_online.offline,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !selectedPrinter) return;
    try {
      const jobId = await submitMutation.mutateAsync({
        printer: selectedPrinter,
        fileName: fileName.trim(),
        priority: BigInt(priority),
      });
      toast.success(`Job #${jobId.toString()} submitted successfully!`);
      setFileName("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit job. Please try again.");
    }
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Submit Print Job</h1>
        <p className="text-sm text-muted-foreground">
          Queue a document for printing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File name */}
        <div className="space-y-1.5">
          <Label htmlFor="file-name" className="text-sm font-semibold">
            Document Name
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. Q3-Report.pdf"
              className="pl-9"
              data-ocid="submit.input"
            />
          </div>
        </div>

        {/* Printer selector */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Select Printer</Label>
          <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
            <SelectTrigger data-ocid="submit.select">
              <SelectValue placeholder="Choose a printer..." />
            </SelectTrigger>
            <SelectContent>
              {displayPrinters.map(([name, s]) => (
                <SelectItem
                  key={name}
                  value={name}
                  disabled={s.status === Variant_busy_offline_online.offline}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        s.status === Variant_busy_offline_online.online
                          ? "bg-green-500"
                          : s.status === Variant_busy_offline_online.busy
                            ? "bg-amber-500"
                            : "bg-red-400",
                      )}
                    />
                    {name}
                    {s.status === Variant_busy_offline_online.offline &&
                      " (Offline)"}
                    {s.status === Variant_busy_offline_online.busy && " (Busy)"}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {availablePrinters.length} of {displayPrinters.length} printers
            available
          </p>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Priority Level</Label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                data-selected={priority === p.value}
                className={cn(
                  "border rounded-lg p-3 text-left transition-all",
                  p.color,
                  priority === p.value
                    ? "ring-2 ring-offset-1 ring-teal-400 font-bold"
                    : "opacity-70 hover:opacity-100",
                )}
                data-ocid={`submit.priority.${p.label.toLowerCase()}.toggle`}
              >
                <p className="text-sm font-semibold">{p.label}</p>
                <p className="text-xs opacity-70">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            !fileName.trim() || !selectedPrinter || submitMutation.isPending
          }
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl"
          data-ocid="submit.submit_button"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Print Job"
          )}
        </Button>
      </form>
    </div>
  );
}
