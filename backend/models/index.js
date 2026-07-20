const sequelize = require('../config/db');
const User = require('./User');
const Employee = require('./Employee');
const Project = require('./Project');
const ProjectTeamMember = require('./ProjectTeamMember');
const Task = require('./Task');
const Milestone = require('./Milestone');
const Document = require('./Document');
const Risk = require('./Risk');
const ComplianceItem = require('./ComplianceItem');
const Approval = require('./Approval');
const ApprovalWorkflow = require('./ApprovalWorkflow');
const ApprovalStep = require('./ApprovalStep');
const Client = require('./Client');
const Proposal = require('./Proposal');
const PipelineSegment = require('./PipelineSegment');
const PipelineAsset = require('./PipelineAsset');
const InspectionLog = require('./InspectionLog');
const IncidentReport = require('./IncidentReport');
const MaintenanceRecord = require('./MaintenanceRecord');


// Relationships

// User <-> Employee (One-to-One profile)
User.hasOne(Employee, { foreignKey: 'userId', as: 'employeeProfile', onDelete: 'CASCADE' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Employee self-referencing (Reporting Manager hierarchy)
Employee.belongsTo(Employee, { foreignKey: 'reportingManagerId', as: 'reportingManager' });
Employee.hasMany(Employee, { foreignKey: 'reportingManagerId', as: 'directReports' });

// Project <-> Employee (Project Manager)
Employee.hasMany(Project, { foreignKey: 'projectManagerId', as: 'managedProjects' });
Project.belongsTo(Employee, { foreignKey: 'projectManagerId', as: 'projectManager' });

// Project <-> Employee (Many-to-Many Team Members)
Project.belongsToMany(Employee, { through: ProjectTeamMember, foreignKey: 'projectId', as: 'teamMembers' });
Employee.belongsToMany(Project, { through: ProjectTeamMember, foreignKey: 'employeeId', as: 'assignedProjects' });

// Direct associations for the join model to make inclusion queries simpler
Project.hasMany(ProjectTeamMember, { foreignKey: 'projectId', as: 'teamAllocations', onDelete: 'CASCADE' });
ProjectTeamMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Employee.hasMany(ProjectTeamMember, { foreignKey: 'employeeId', as: 'projectAllocations', onDelete: 'CASCADE' });
ProjectTeamMember.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Task <-> Project
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Task <-> Employee (Assignee is now an Employee)
Employee.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(Employee, { foreignKey: 'assigneeId', as: 'assignee' });

// Milestone <-> Project
Project.hasMany(Milestone, { foreignKey: 'projectId', as: 'milestones', onDelete: 'CASCADE' });
Milestone.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Document <-> Project
Project.hasMany(Document, { foreignKey: 'projectId', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Document <-> Employee (Uploader is now an Employee)
Employee.hasMany(Document, { foreignKey: 'uploadedById', as: 'uploadedDocuments' });
Document.belongsTo(Employee, { foreignKey: 'uploadedById', as: 'uploader' });

// Risk <-> Project
Project.hasMany(Risk, { foreignKey: 'projectId', as: 'risks', onDelete: 'CASCADE' });
Risk.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Risk <-> Employee (Owner is now an Employee)
Employee.hasMany(Risk, { foreignKey: 'ownerId', as: 'ownedRisks' });
Risk.belongsTo(Employee, { foreignKey: 'ownerId', as: 'owner' });

// ComplianceItem <-> Project
Project.hasMany(ComplianceItem, { foreignKey: 'projectId', as: 'complianceItems', onDelete: 'CASCADE' });
ComplianceItem.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Approval <-> Project
Project.hasMany(Approval, { foreignKey: 'projectId', as: 'approvals', onDelete: 'CASCADE' });
Approval.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Approval <-> User (Requester)
User.hasMany(Approval, { foreignKey: 'requestedById', as: 'requestedApprovals' });
Approval.belongsTo(User, { foreignKey: 'requestedById', as: 'requester' });

// Approval <-> User (Approver)
User.hasMany(Approval, { foreignKey: 'assignedApproverId', as: 'assignedReviews' });
Approval.belongsTo(User, { foreignKey: 'assignedApproverId', as: 'approver' });

// ApprovalWorkflow & ApprovalStep Associations
Project.hasMany(ApprovalWorkflow, { foreignKey: 'projectId', as: 'approvalWorkflows', onDelete: 'CASCADE' });
ApprovalWorkflow.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

ApprovalWorkflow.hasMany(ApprovalStep, { foreignKey: 'workflowId', as: 'steps', onDelete: 'CASCADE' });
ApprovalStep.belongsTo(ApprovalWorkflow, { foreignKey: 'workflowId', as: 'workflow' });

User.hasMany(ApprovalStep, { foreignKey: 'approverId', as: 'assignedSteps' });
ApprovalStep.belongsTo(User, { foreignKey: 'approverId', as: 'approverUser' });

// Client & Proposal Associations (Module 9)
Client.hasMany(Proposal, { foreignKey: 'clientId', as: 'proposals', onDelete: 'CASCADE' });
Proposal.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Proposal <-> Employee (Creator)
Employee.hasMany(Proposal, { foreignKey: 'createdById', as: 'createdProposals' });
Proposal.belongsTo(Employee, { foreignKey: 'createdById', as: 'creator' });

// PipelineSegment <-> PipelineAsset
PipelineSegment.hasMany(PipelineAsset, { foreignKey: 'segmentId', as: 'assets', onDelete: 'CASCADE' });
PipelineAsset.belongsTo(PipelineSegment, { foreignKey: 'segmentId', as: 'segment' });

// PipelineSegment <-> InspectionLog
PipelineSegment.hasMany(InspectionLog, { foreignKey: 'segmentId', as: 'inspections', onDelete: 'CASCADE' });
InspectionLog.belongsTo(PipelineSegment, { foreignKey: 'segmentId', as: 'segment' });

// InspectionLog <-> Employee (Inspector)
Employee.hasMany(InspectionLog, { foreignKey: 'inspectorId', as: 'inspections' });
InspectionLog.belongsTo(Employee, { foreignKey: 'inspectorId', as: 'inspector' });

// PipelineSegment <-> IncidentReport
PipelineSegment.hasMany(IncidentReport, { foreignKey: 'segmentId', as: 'incidents', onDelete: 'CASCADE' });
IncidentReport.belongsTo(PipelineSegment, { foreignKey: 'segmentId', as: 'segment' });

// IncidentReport <-> Employee (Reporter)
Employee.hasMany(IncidentReport, { foreignKey: 'reportedById', as: 'reportedIncidents' });
IncidentReport.belongsTo(Employee, { foreignKey: 'reportedById', as: 'reportedBy' });

// PipelineSegment <-> MaintenanceRecord
PipelineSegment.hasMany(MaintenanceRecord, { foreignKey: 'segmentId', as: 'maintenanceRecords', onDelete: 'CASCADE' });
MaintenanceRecord.belongsTo(PipelineSegment, { foreignKey: 'segmentId', as: 'segment' });

// PipelineAsset <-> MaintenanceRecord
PipelineAsset.hasMany(MaintenanceRecord, { foreignKey: 'assetId', as: 'maintenanceRecords', onDelete: 'CASCADE' });
MaintenanceRecord.belongsTo(PipelineAsset, { foreignKey: 'assetId', as: 'asset' });

// MaintenanceRecord <-> Employee (Technician)
Employee.hasMany(MaintenanceRecord, { foreignKey: 'technicianId', as: 'maintenanceTasks' });
MaintenanceRecord.belongsTo(Employee, { foreignKey: 'technicianId', as: 'technician' });

// PipelineSegment <-> Risk
PipelineSegment.hasMany(Risk, { foreignKey: 'segmentId', as: 'risks', onDelete: 'CASCADE' });
Risk.belongsTo(PipelineSegment, { foreignKey: 'segmentId', as: 'segment' });

// PipelineSegment <-> ComplianceItem
PipelineSegment.hasMany(ComplianceItem, { foreignKey: 'segmentId', as: 'complianceItems', onDelete: 'CASCADE' });
ComplianceItem.belongsTo(PipelineSegment, { foreignKey: 'segmentId', as: 'compliance' });


module.exports = {
  sequelize,
  User,
  Employee,
  Project,
  ProjectTeamMember,
  Task,
  Milestone,
  Document,
  Risk,
  ComplianceItem,
  Approval,
  ApprovalWorkflow,
  ApprovalStep,
  Client,
  Proposal,
  PipelineSegment,
  PipelineAsset,
  InspectionLog,
  IncidentReport,
  MaintenanceRecord
};
