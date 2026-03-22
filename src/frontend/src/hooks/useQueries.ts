import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  FileName,
  JobId,
  PrinterName,
  Priority,
  UserProfile,
} from "../backend.d";
import { UserRole, type Variant_busy_offline_online } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllPrinters() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["allPrinters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPrinters();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useGetAllJobs() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["allJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobs();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

export function useGetJobsByUser() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["jobsByUser", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getJobsByUser(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 15000,
  });
}

export function useGetJobQueue() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["jobQueue"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobQueue();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useSubmitPrintJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      printer,
      fileName,
      priority,
    }: { printer: PrinterName; fileName: FileName; priority: Priority }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitPrintJob(printer, fileName, priority);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allJobs"] });
      qc.invalidateQueries({ queryKey: ["jobsByUser"] });
      qc.invalidateQueries({ queryKey: ["jobQueue"] });
      qc.invalidateQueries({ queryKey: ["allPrinters"] });
    },
  });
}

export function useCancelPrintJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelPrintJob(jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allJobs"] });
      qc.invalidateQueries({ queryKey: ["jobsByUser"] });
      qc.invalidateQueries({ queryKey: ["jobQueue"] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteJob(jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allJobs"] });
      qc.invalidateQueries({ queryKey: ["jobQueue"] });
    },
  });
}

export function useUpdatePrinterStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      printer,
      status,
    }: { printer: PrinterName; status: Variant_busy_offline_online }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePrinterStatus(printer, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allPrinters"] }),
  });
}

export function useUpdateInkLevel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      printer,
      inkLevel,
    }: { printer: PrinterName; inkLevel: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateInkLevel(printer, inkLevel);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allPrinters"] }),
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: { principal: string; role: UserRole }) => {
      if (!actor) throw new Error("Not connected");
      // Dynamic import for Principal
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.assignCallerUserRole(Principal.fromText(principal), role);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerUserRole"] }),
  });
}
