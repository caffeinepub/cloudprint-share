import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type PrinterName = Text;
  let printerNameA : PrinterName = "cannon_CB023-5";
  let printerNameB : PrinterName = "epson_404";
  let printerNameC : PrinterName = "label_maker";
  let printerNameD : PrinterName = "3d_printer_1000f";
  let printerNames = [printerNameA, printerNameB, printerNameC, printerNameD];

  type JobId = Nat;
  type FileName = Text;
  type Priority = Nat;

  type PrinterStatus = {
    status : {
      #online;
      #offline;
      #busy;
    };
    inkLevel : Nat;
    lastJob : ?JobId;
  };

  type PrintJob = {
    jobId : JobId;
    user : Principal;
    printer : PrinterName;
    fileName : FileName;
    status : {
      #pending;
      #printing;
      #completed;
      #cancelled;
    };
    submitted : Time.Time;
    priority : Priority;
  };

  module PrintJob {
    public func compareByJobId(job1 : PrintJob, job2 : PrintJob) : Order.Order {
      Nat.compare(job1.jobId, job2.jobId);
    };
    public func compareByPriority(job1 : PrintJob, job2 : PrintJob) : Order.Order {
      Nat.compare(job1.priority, job2.priority);
    };
    public func compareBySubmitTime(job1 : PrintJob, job2 : PrintJob) : Order.Order {
      Int.compare(job1.submitted, job2.submitted);
    };
  };

  // CANNOT EDIT: Authorization and role-based access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Printers Management
  let printers = Map.fromIter<PrinterName, PrinterStatus>(printerNames.values().map(func(name) { (name, { status = #online; inkLevel = 100; lastJob = null }) }));

  // Jobs Management
  var nextJobId = 1;
  let jobs = Map.empty<JobId, PrintJob>();

  public shared ({ caller }) func submitPrintJob(printer : PrinterName, fileName : FileName, priority : Priority) : async JobId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit jobs");
    };

    let jobId : JobId = nextJobId;
    nextJobId += 1;

    let job : PrintJob = {
      jobId;
      user = caller;
      printer;
      fileName;
      status = #pending;
      submitted = Time.now();
      priority;
    };

    jobs.add(jobId, job);

    // Set printer to busy
    switch (printers.get(printer)) {
      case (?printerStatus) {
        let newStatus : PrinterStatus = {
          status = #busy;
          inkLevel = printerStatus.inkLevel;
          lastJob = ?jobId;
        };
        printers.add(printer, newStatus);
      };
      case (null) {};
    };

    jobId;
  };

  public shared ({ caller }) func cancelPrintJob(jobId : JobId) : async () {
    let job = switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) { job };
    };

    if (caller != job.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only job owners or admins can cancel jobs");
    };

    // Update job and printer status
    jobs.add(jobId, { job with status = #cancelled });

    switch (printers.get(job.printer)) {
      case (?printerStatus) {
        let newStatus : PrinterStatus = {
          status = #offline;
          inkLevel = printerStatus.inkLevel;
          lastJob = ?jobId;
        };
        printers.add(job.printer, newStatus);
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func updatePrinterStatus(printer : PrinterName, status : {
    #online;
    #offline;
    #busy;
  }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update printer statuses");
    };

    let currentStatus = switch (printers.get(printer)) {
      case (null) { Runtime.trap("Printer not found") };
      case (?printerStatus) { printerStatus };
    };

    let newStatus : PrinterStatus = {
      status;
      inkLevel = currentStatus.inkLevel;
      lastJob = currentStatus.lastJob;
    };

    printers.add(printer, newStatus);
  };

  public shared ({ caller }) func updateInkLevel(printer : PrinterName, inkLevel : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update ink levels");
    };

    let currentStatus = switch (printers.get(printer)) {
      case (null) { Runtime.trap("Printer not found") };
      case (?printerStatus) { printerStatus };
    };

    let newStatus : PrinterStatus = {
      status = currentStatus.status;
      inkLevel;
      lastJob = currentStatus.lastJob;
    };

    printers.add(printer, newStatus);
  };

  public shared ({ caller }) func deleteJob(jobId : JobId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete jobs");
    };
    jobs.remove(jobId);
  };

  // Query Functions

  public query ({ caller }) func getPrinterStatus(printer : PrinterName) : async PrinterStatus {
    switch (printers.get(printer)) {
      case (null) { Runtime.trap("Printer not found") };
      case (?status) { status };
    };
  };

  public query ({ caller }) func getAllPrinters() : async [(PrinterName, PrinterStatus)] {
    printers.entries().toArray().sort(func(entry1, entry2) { Text.compare(entry1.0, entry2.0) });
  };

  public query ({ caller }) func getJobStatus(jobId : JobId) : async PrintJob {
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) { job };
    };
  };

  public query ({ caller }) func getAllJobs() : async [PrintJob] {
    jobs.values().toArray().sort(PrintJob.compareByPriority);
  };

  public query ({ caller }) func getJobsByStatus(status : {
    #pending;
    #printing;
    #completed;
    #cancelled;
  }) : async [PrintJob] {
    let filteredJobs = List.empty<PrintJob>();
    for (job in jobs.values()) {
      if (job.status == status) {
        filteredJobs.add(job);
      };
    };
    filteredJobs.toArray<PrintJob>().sort(PrintJob.compareBySubmitTime);
  };

  public query ({ caller }) func getJobsByPrinter(printer : PrinterName) : async [PrintJob] {
    jobs.values().toArray().filter(func(job) { job.printer == printer }).sort(PrintJob.compareBySubmitTime);
  };

  public query ({ caller }) func getJobsByUser(user : Principal) : async [PrintJob] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view other users' jobs");
    };
    jobs.values().toArray().filter(func(job) { job.user == user });
  };

  public query ({ caller }) func getJobQueue() : async [PrintJob] {
    jobs.values().toArray().filter(func(job) { job.status == #pending or job.status == #printing });
  };

  public query ({ caller }) func getPrinterJobCount(printer : PrinterName) : async Nat {
    var count = 0;
    for (job in jobs.values()) {
      if (job.printer == printer) { count += 1 };
    };
    count;
  };
};
