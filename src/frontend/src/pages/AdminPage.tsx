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
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Settings, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type PrinterStatus,
  UserRole,
  Variant_busy_offline_online,
} from "../backend.d";
import {
  JobStatusBadge,
  PrinterStatusBadge,
  PriorityBadge,
} from "../components/StatusBadge";
import {
  useAssignUserRole,
  useDeleteJob,
  useGetAllJobs,
  useGetAllPrinters,
  useUpdateInkLevel,
  useUpdatePrinterStatus,
} from "../hooks/useQueries";

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

export default function AdminPage() {
  const { data: printers, isLoading: loadingPrinters } = useGetAllPrinters();
  const { data: jobs, isLoading: loadingJobs } = useGetAllJobs();
  const updateStatusMutation = useUpdatePrinterStatus();
  const updateInkMutation = useUpdateInkLevel();
  const deleteJobMutation = useDeleteJob();
  const assignRoleMutation = useAssignUserRole();

  const [inkLevels, setInkLevels] = useState<Record<string, number>>({});
  const [assignPrincipal, setAssignPrincipal] = useState("");
  const [assignRole, setAssignRole] = useState<UserRole>(UserRole.user);

  const displayPrinters = (
    printers && printers.length > 0 ? printers : MOCK_PRINTERS
  ) as [string, PrinterStatus][];

  const handleStatusUpdate = async (
    printer: string,
    status: Variant_busy_offline_online,
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ printer, status });
      toast.success(`${printer} status updated.`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleInkUpdate = async (printer: string) => {
    const level = inkLevels[printer];
    if (level === undefined) return;
    try {
      await updateInkMutation.mutateAsync({
        printer,
        inkLevel: BigInt(Math.round(level)),
      });
      toast.success(`${printer} ink level updated.`);
    } catch {
      toast.error("Failed to update ink level.");
    }
  };

  const handleDeleteJob = async (jobId: bigint) => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
      toast.success(`Job #${jobId.toString()} deleted.`);
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignPrincipal.trim()) return;
    try {
      await assignRoleMutation.mutateAsync({
        principal: assignPrincipal.trim(),
        role: assignRole,
      });
      toast.success("Role assigned successfully.");
      setAssignPrincipal("");
    } catch {
      toast.error("Failed to assign role. Check the principal ID.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">
          Manage printers, jobs, and users
        </p>
      </div>

      <Tabs defaultValue="printers">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="printers" data-ocid="admin.printers.tab">
            Printers
          </TabsTrigger>
          <TabsTrigger value="jobs" data-ocid="admin.jobs.tab">
            Jobs
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="admin.users.tab">
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="printers" className="space-y-3 mt-4">
          {loadingPrinters ? (
            <div className="space-y-3" data-ocid="admin.printers.loading_state">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : (
            displayPrinters.map(([name, status]) => (
              <div
                key={name}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-teal-500" />
                    <span className="font-semibold text-sm">{name}</span>
                  </div>
                  <PrinterStatusBadge status={status.status} />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Set Status
                  </Label>
                  <div className="flex gap-2">
                    {[
                      {
                        s: Variant_busy_offline_online.online,
                        label: "Online",
                        cls: "border-green-300 hover:bg-green-50 text-green-700",
                      },
                      {
                        s: Variant_busy_offline_online.busy,
                        label: "Busy",
                        cls: "border-amber-300 hover:bg-amber-50 text-amber-700",
                      },
                      {
                        s: Variant_busy_offline_online.offline,
                        label: "Offline",
                        cls: "border-red-300 hover:bg-red-50 text-red-700",
                      },
                    ].map(({ s, label, cls }) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(name, s)}
                        className={`flex-1 text-xs ${cls}`}
                        data-ocid={`admin.printer.${name.replace(" ", "").toLowerCase()}.${label.toLowerCase()}.button`}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs text-muted-foreground">
                      Ink Level
                    </Label>
                    <span className="text-xs font-bold">
                      {inkLevels[name] !== undefined
                        ? inkLevels[name]
                        : Number(status.inkLevel)}
                      %
                    </span>
                  </div>
                  <Slider
                    value={[
                      inkLevels[name] !== undefined
                        ? inkLevels[name]
                        : Number(status.inkLevel),
                    ]}
                    onValueChange={([v]) =>
                      setInkLevels((prev) => ({ ...prev, [name]: v }))
                    }
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleInkUpdate(name)}
                    disabled={inkLevels[name] === undefined}
                    className="w-full text-xs bg-teal-500 hover:bg-teal-600 text-white"
                    data-ocid="admin.printer.ink.save_button"
                  >
                    Save Ink Level
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-2 mt-4">
          {loadingJobs ? (
            <div className="space-y-2" data-ocid="admin.jobs.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : !jobs?.length ? (
            <div
              className="text-center py-12 text-muted-foreground text-sm"
              data-ocid="admin.jobs.empty_state"
            >
              No jobs found.
            </div>
          ) : (
            [...jobs]
              .sort((a, b) => Number(b.priority - a.priority))
              .map((job, i) => (
                <div
                  key={job.jobId.toString()}
                  className="bg-card border border-border rounded-xl p-3 flex items-center gap-2"
                  data-ocid={`admin.jobs.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {job.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.printer} · #{job.jobId.toString()}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <PriorityBadge priority={job.priority} />
                      <JobStatusBadge status={job.status} />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteJob(job.jobId)}
                    disabled={deleteJobMutation.isPending}
                    className="text-red-500 border-red-200 hover:bg-red-50 flex-shrink-0"
                    data-ocid={`admin.jobs.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-500" />
              <span className="font-semibold text-sm">Assign User Role</span>
            </div>
            <form onSubmit={handleAssignRole} className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Principal ID
                </Label>
                <Input
                  value={assignPrincipal}
                  onChange={(e) => setAssignPrincipal(e.target.value)}
                  placeholder="aaaaa-bbbbb-..."
                  className="text-xs font-mono"
                  data-ocid="admin.users.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Role
                </Label>
                <Select
                  value={assignRole}
                  onValueChange={(v) => setAssignRole(v as UserRole)}
                >
                  <SelectTrigger data-ocid="admin.users.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.admin}>Admin</SelectItem>
                    <SelectItem value={UserRole.user}>User</SelectItem>
                    <SelectItem value={UserRole.guest}>Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={
                  !assignPrincipal.trim() || assignRoleMutation.isPending
                }
                className="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm"
                data-ocid="admin.users.submit_button"
              >
                {assignRoleMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Role"
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
