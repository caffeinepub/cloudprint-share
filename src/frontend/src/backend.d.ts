import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Priority = bigint;
export type Time = bigint;
export type PrinterName = string;
export type FileName = string;
export type JobId = bigint;
export interface PrintJob {
    status: Variant_cancelled_printing_pending_completed;
    submitted: Time;
    user: Principal;
    jobId: JobId;
    fileName: FileName;
    printer: PrinterName;
    priority: Priority;
}
export interface UserProfile {
    name: string;
}
export interface PrinterStatus {
    status: Variant_busy_offline_online;
    inkLevel: bigint;
    lastJob?: JobId;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_busy_offline_online {
    busy = "busy",
    offline = "offline",
    online = "online"
}
export enum Variant_cancelled_printing_pending_completed {
    cancelled = "cancelled",
    printing = "printing",
    pending = "pending",
    completed = "completed"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelPrintJob(jobId: JobId): Promise<void>;
    deleteJob(jobId: JobId): Promise<void>;
    getAllJobs(): Promise<Array<PrintJob>>;
    getAllPrinters(): Promise<Array<[PrinterName, PrinterStatus]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJobQueue(): Promise<Array<PrintJob>>;
    getJobStatus(jobId: JobId): Promise<PrintJob>;
    getJobsByPrinter(printer: PrinterName): Promise<Array<PrintJob>>;
    getJobsByStatus(status: Variant_cancelled_printing_pending_completed): Promise<Array<PrintJob>>;
    getJobsByUser(user: Principal): Promise<Array<PrintJob>>;
    getPrinterJobCount(printer: PrinterName): Promise<bigint>;
    getPrinterStatus(printer: PrinterName): Promise<PrinterStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitPrintJob(printer: PrinterName, fileName: FileName, priority: Priority): Promise<JobId>;
    updateInkLevel(printer: PrinterName, inkLevel: bigint): Promise<void>;
    updatePrinterStatus(printer: PrinterName, status: Variant_busy_offline_online): Promise<void>;
}
