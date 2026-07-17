const { User, Employee, Project, ProjectTeamMember, Task, Milestone, Document, Risk, ComplianceItem, Approval, ApprovalWorkflow, ApprovalStep, Client, Proposal, sequelize } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding for Module 9...');
    
    await sequelize.sync({ force: true });
    console.log('✔️ Database schema synchronized.');

    // 1. Create Users
    const usersData = [
      {
        name: 'Sarah Jenkins',
        email: 'admin@industrial-project.com',
        password: 'password123',
        role: 'Admin',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        name: 'Marcus Vance',
        email: 'director@industrial-project.com',
        password: 'password123',
        role: 'PMO Director',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        name: 'Elena Rostova',
        email: 'pm.buildings@industrial-project.com',
        password: 'password123',
        role: 'Project Manager',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      },
      {
        name: 'David Kojo',
        email: 'pm.water@industrial-project.com',
        password: 'password123',
        role: 'Project Manager',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        name: 'Liam Chen',
        email: 'pm.healthcare@industrial-project.com',
        password: 'password123',
        role: 'Project Manager',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        name: 'Chloe Dupont',
        email: 'pm.design@industrial-project.com',
        password: 'password123',
        role: 'Project Manager',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        name: 'Carlos Mendez',
        email: 'eng.mep@industrial-project.com',
        password: 'password123',
        role: 'Engineer',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
      },
      {
        name: 'Priya Patel',
        email: 'eng.bim@industrial-project.com',
        password: 'password123',
        role: 'Engineer',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
      },
      {
        name: 'Mei Tanaka',
        email: 'mei.tanaka@industrial-project.com',
        password: 'password123',
        role: 'Engineer',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      }
    ];

    const users = await User.bulkCreate(usersData, { individualHooks: true });
    console.log(`✔️ Seeded ${users.length} Users.`);

    const userMap = {};
    users.forEach(u => {
      userMap[u.email] = u.id;
    });

    // 2. Create Employees
    const employeesData = [
      { userId: userMap['admin@industrial-project.com'], department: 'PMO & Administration', discipline: 'Civil', designation: 'Managing Director & HR Lead', reportingManagerId: null, phone: '+1-555-0100', joinDate: '2020-01-15', availabilityStatus: 'Available' },
      { userId: userMap['director@industrial-project.com'], department: 'PMO Office', discipline: 'Civil', designation: 'PMO Director', reportingManagerId: 1, phone: '+1-555-0101', joinDate: '2021-03-01', availabilityStatus: 'Available' },
      { userId: userMap['pm.buildings@industrial-project.com'], department: 'Buildings & Structural Division', discipline: 'Civil', designation: 'Senior Project Manager', reportingManagerId: 2, phone: '+1-555-0102', joinDate: '2022-05-10', availabilityStatus: 'Available' },
      { userId: userMap['pm.water@industrial-project.com'], department: 'Infrastructure & Hydrology Division', discipline: 'WaterEnvironmental', designation: 'Project Manager - Water Treatment', reportingManagerId: 2, phone: '+1-555-0103', joinDate: '2022-08-15', availabilityStatus: 'Available' },
      { userId: userMap['pm.healthcare@industrial-project.com'], department: 'Healthcare & Life Sciences Planning', discipline: 'HealthcarePlanning', designation: 'Project Manager - Medical Facilities', reportingManagerId: 2, phone: '+1-555-0104', joinDate: '2023-01-20', availabilityStatus: 'Available' },
      { userId: userMap['pm.design@industrial-project.com'], department: 'Interior Architecture & Design', discipline: 'InteriorDesign', designation: 'Design Manager', reportingManagerId: 2, phone: '+1-555-0105', joinDate: '2023-04-12', availabilityStatus: 'Available' },
      { userId: userMap['mei.tanaka@industrial-project.com'], department: 'Buildings & Structural Division', discipline: 'Civil', designation: 'Lead Structural Engineer', reportingManagerId: 3, phone: '+1-555-0106', joinDate: '2023-06-01', availabilityStatus: 'Available' },
      { userId: userMap['eng.mep@industrial-project.com'], department: 'Buildings & Structural Division', discipline: 'MEP', designation: 'Lead Mechanical Engineer', reportingManagerId: 3, phone: '+1-555-0113', joinDate: '2022-09-01', availabilityStatus: 'Available' },
      { userId: userMap['eng.bim@industrial-project.com'], department: 'BIM & Digital Twin Division', discipline: 'BIM', designation: 'BIM Coordinator', reportingManagerId: 3, phone: '+1-555-0116', joinDate: '2022-12-15', availabilityStatus: 'Available' }
    ];

    const employees = await Employee.bulkCreate(employeesData);
    console.log(`✔️ Seeded ${employees.length} Employee Profiles.`);

    // 3. Seed CRM Clients (Module 9)
    const clientsData = [
      { companyName: 'NEOM Authority', industry: 'Infrastructure & Smart Cities', contactPersonName: 'Fahad Al-Qahtani', contactEmail: 'fahad.qahtani@neom.com', contactPhone: '+966-50-111-2222', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'Saudi Aramco', industry: 'Oil & Gas / Energy', contactPersonName: 'Khalid Al-Ghamdi', contactEmail: 'khalid.ghamdi@aramco.com', contactPhone: '+966-50-222-3333', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'Diriyah Gate Development Authority (DGDA)', industry: 'Tourism & Real Estate Heritage', contactPersonName: 'Sarah Al-Saud', contactEmail: 'sarah.saud@dgda.gov.sa', contactPhone: '+966-50-333-4444', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'National Water Company (NWC)', industry: 'Utilities / Water Management', contactPersonName: 'Mohammed Al-Harbi', contactEmail: 'mohammed.harbi@nwc.com.sa', contactPhone: '+966-50-444-5555', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'Red Sea Global (RSG)', industry: 'Real Estate & Hospitality', contactPersonName: 'Abdullah Al-Dossary', contactEmail: 'abdullah.dossary@redseaglobal.com', contactPhone: '+966-50-555-6666', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'ROSHN Real Estate Co.', industry: 'Real Estate Development', contactPersonName: 'Yousef Al-Malki', contactEmail: 'yousef.malki@roshn.sa', contactPhone: '+966-50-666-7777', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'Ministry of Health', industry: 'Healthcare Planning & Government', contactPersonName: 'Dr. Tariq Al-Zahrani', contactEmail: 'tariq.zahrani@moh.gov.sa', contactPhone: '+966-50-777-8888', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'Qiddiya Investment Company', industry: 'Entertainment & Master Planning', contactPersonName: 'Nasser Al-Mutairi', contactEmail: 'nasser.mutairi@qiddiya.com', contactPhone: '+966-50-888-9999', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'Saudi Electricity Company (SEC)', industry: 'Utilities / Power Distribution', contactPersonName: 'Faisal Al-Otaibi', contactEmail: 'faisal.otaibi@se.com.sa', contactPhone: '+966-50-999-0000', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'Riyadh Royal Commission', industry: 'Urban Planning / Mass Transit', contactPersonName: 'Musaed Al-Sudairy', contactEmail: 'musaed.sudairy@rcrc.gov.sa', contactPhone: '+966-50-000-1111', country: 'Saudi Arabia', relationshipStatus: 'Active' },
      { companyName: 'Jabal Omar Development', industry: 'Real Estate & Hospitality', contactPersonName: 'Hisham Al-Farsi', contactEmail: 'hisham.farsi@jabalomar.com.sa', contactPhone: '+966-50-111-3333', country: 'Saudi Arabia', relationshipStatus: 'Prospect' },
      { companyName: 'Al-Khafji Joint Operations', industry: 'Energy / Petroleum extraction', contactPersonName: 'Saeed Al-Ghamdi', contactEmail: 'saeed.ghamdi@akjo.com.sa', contactPhone: '+966-50-222-4444', country: 'Saudi Arabia', relationshipStatus: 'Prospect' },
      { companyName: 'King Salman Park Foundation', industry: 'Urban Parks & Infrastructure', contactPersonName: 'Bandar Al-Mogren', contactEmail: 'bandar.mogren@kspf.sa', contactPhone: '+966-50-333-5555', country: 'Saudi Arabia', relationshipStatus: 'Active' }
    ];

    const clients = await Client.bulkCreate(clientsData);
    console.log(`✔️ Seeded ${clients.length} CRM Clients.`);

    // 4. Create Projects (clientName matches Client companyNames to link dynamically)
    const projectsData = [
      { name: 'NEOM Spine Tunnel Structural Design', clientName: 'NEOM Authority', serviceCategory: 'Buildings', description: 'Detailed structural design for the Spine segments.', budget: 45000000.00, budgetSpent: 12500000.00, startDate: '2026-01-10', endDate: '2027-12-30', currentPhase: 'Execution', status: 'OnTrack', projectManagerId: 3 },
      { name: 'King Salman Park Infrastructure Master Plan', clientName: 'King Salman Park Foundation', serviceCategory: 'UrbanPlanning', description: 'Zoning & transportation framework routing.', budget: 12500000.00, budgetSpent: 3500000.00, startDate: '2026-03-01', endDate: '2027-04-28', currentPhase: 'Design', status: 'OnTrack', projectManagerId: 4 },
      { name: 'Aramco Admin Complex HVAC Refit', clientName: 'Saudi Aramco', serviceCategory: 'HeatingCooling', description: 'Chilled water layout ventilation upgrade.', budget: 8400000.00, budgetSpent: 6200000.00, startDate: '2025-06-01', endDate: '2026-09-30', currentPhase: 'Execution', status: 'AtRisk', projectManagerId: 3 },
      { name: 'Diriyah Gate Historic Substation Integration', clientName: 'Diriyah Gate Development Authority (DGDA)', serviceCategory: 'PowerTransmissionDistribution', description: 'Concealed high voltage underground routing.', budget: 18200000.00, budgetSpent: 14900000.00, startDate: '2025-08-15', endDate: '2026-11-20', currentPhase: 'Execution', status: 'Delayed', projectManagerId: 3 },
      { name: 'Jeddah Central Seawater Desalination Plant', clientName: 'National Water Company (NWC)', serviceCategory: 'WaterTreatment', description: 'Desalination plant engineering layout.', budget: 35000000.00, budgetSpent: 4200000.00, startDate: '2026-05-01', endDate: '2028-06-15', currentPhase: 'Design', status: 'OnTrack', projectManagerId: 4 },
      { name: 'Riyadh South Biological Wastewater Plant', clientName: 'Ministry of Health', serviceCategory: 'WastewaterTreatment', description: 'Activated sludge biological plant.', budget: 52000000.00, budgetSpent: 28300000.00, startDate: '2025-03-01', endDate: '2027-02-28', currentPhase: 'Execution', status: 'OnTrack', projectManagerId: 4 },
      { name: 'ROSHN Residential Phase 2 Interior Architecture', clientName: 'ROSHN Real Estate Co.', serviceCategory: 'InteriorDesign', description: 'Detailed custom joinery for 450 villas.', budget: 6800000.00, budgetSpent: 2100000.00, startDate: '2026-02-01', endDate: '2026-12-15', currentPhase: 'Approval', status: 'OnTrack', projectManagerId: 6 }
    ];

    const projects = await Project.bulkCreate(projectsData);
    console.log(`✔️ Seeded ${projects.length} Project Records.`);

    // 5. Seed ProjectTeamMembers
    const teamAssignments = [
      { projectId: 1, employeeId: 7, roleOnProject: 'Lead MEP Liaison', allocationPercent: 25 },
      { projectId: 1, employeeId: 8, roleOnProject: 'Lead BIM Coordinator', allocationPercent: 50 },
      { projectId: 1, employeeId: 9, roleOnProject: 'Lead Structural Engineer', allocationPercent: 100 }
    ];
    await ProjectTeamMember.bulkCreate(teamAssignments);

    // 6. Seed CRM Proposals (Module 9)
    // Client IDs: NEOM=1, Aramco=2, DGDA=3, NWC=4, RSG=5, ROSHN=6, MOH=7, Qiddiya=8, SEC=9, RCRC=10, Jabal=11, AKJO=12, KSPF=13
    const proposalsData = [
      { clientId: 4, title: 'Wastewater Treatment Plant Extension Phase 3', serviceCategory: 'WastewaterTreatment', estimatedValue: 12400000.00, status: 'Negotiation', createdById: 3, sentDate: '2026-05-15', decisionDate: null },
      { clientId: 5, title: 'Red Sea Resort Solar array battery storage containment', serviceCategory: 'PowerTransmissionDistribution', estimatedValue: 4800000.00, status: 'Sent', createdById: 4, sentDate: '2026-06-10', decisionDate: null },
      { clientId: 6, title: 'ROSHN Towers Modular BIM Coordination contract', serviceCategory: 'BIM', estimatedValue: 6500000.00, status: 'Won', createdById: 3, sentDate: '2026-03-01', decisionDate: '2026-04-15' },
      { clientId: 11, title: 'Jabal Omar Boutique Hotel Digital Twin models', serviceCategory: 'BIM', estimatedValue: 3200000.00, status: 'Draft', createdById: 9, sentDate: null, decisionDate: null },
      { clientId: 1, title: 'NEOM Spine structural tunnel segment analysis', serviceCategory: 'Buildings', estimatedValue: 18500000.00, status: 'Negotiation', createdById: 3, sentDate: '2026-06-18', decisionDate: null },
      { clientId: 5, title: 'Amaala Wellness Clinic negative pressure isolation units', serviceCategory: 'Healthcare', estimatedValue: 7200000.00, status: 'Sent', createdById: 5, sentDate: '2026-07-02', decisionDate: null },
      { clientId: 3, title: 'Diriyah boutique hotel geothermal cooling upgrade', serviceCategory: 'HeatingCooling', estimatedValue: 9800000.00, status: 'Won', createdById: 3, sentDate: '2026-04-20', decisionDate: '2026-06-01' },
      { clientId: 10, title: 'Al-Khobar Municipality canal gravity expansions', serviceCategory: 'WastewaterTreatment', estimatedValue: 14500000.00, status: 'Lost', createdById: 4, sentDate: '2026-02-15', decisionDate: '2026-04-30' },
      { clientId: 2, title: 'Saudi Aramco central complex district chillers overhaul', serviceCategory: 'HeatingCooling', estimatedValue: 24000000.00, status: 'Negotiation', createdById: 3, sentDate: '2026-06-01', decisionDate: null },
      { clientId: 13, title: 'King Salman Park utility loops and zoning drafting', serviceCategory: 'UrbanPlanning', estimatedValue: 8600000.00, status: 'Won', createdById: 4, sentDate: '2026-01-10', decisionDate: '2026-02-28' },
      { clientId: 12, title: 'Al-Khafji refinery substation cabling models', serviceCategory: 'PowerTransmissionDistribution', estimatedValue: 11000000.00, status: 'Draft', createdById: 8, sentDate: null, decisionDate: null },
      { clientId: 9, title: 'SEC substations modular BIM grid extensions', serviceCategory: 'BIM', estimatedValue: 5300000.00, status: 'Draft', createdById: 9, sentDate: null, decisionDate: null }
    ];

    await Proposal.bulkCreate(proposalsData);
    console.log('✔️ Seeded 12 CRM Proposals (Module 9).');

    // 7. Seed Tasks
    const seededTasks = [
      { projectId: 1, title: 'Geotechnical Soil Analysis', description: 'Execute soil boreholes.', assigneeId: 9, dueDate: '2026-06-15', priority: 'High', status: 'Done', phase: 'Design' }
    ];
    await Task.bulkCreate(seededTasks);

    // 8. Seed Milestones
    const seededMilestones = [
      { projectId: 1, title: 'Initial Design Sign-off', targetDate: '2026-02-15', status: 'Achieved' }
    ];
    await Milestone.bulkCreate(seededMilestones);

    // 9. Seed Documents
    const seededDocuments = [
      { projectId: 1, fileName: 'NEOM_Spine_Design_Criteria.pdf', fileType: 'pdf', filePath: '#', version: 1, uploadedById: 3, discipline: 'General', description: 'Primary design bounds.', fileSizeKB: 1450 }
    ];
    await Document.bulkCreate(seededDocuments);

    // 10. Seed Risks
    const seededRisks = [
      { projectId: 1, title: 'Geotechnical Site Excavation variations', description: 'Subsurface density variations.', category: 'Technical', probability: 3, impact: 4, riskScore: 12, status: 'Open', mitigationPlan: 'Perform supplementary radar scans.', ownerId: 7, identifiedDate: '2026-03-15' }
    ];
    await Risk.bulkCreate(seededRisks);

    // 11. Seed Compliance
    const seededCompliance = [
      { projectId: 1, requirementName: 'Municipality Construction Permit', applicableServiceCategory: 'Buildings', status: 'Compliant', dueDate: '2026-05-15', notes: 'Expedited approval secured.' }
    ];
    await ComplianceItem.bulkCreate(seededCompliance);

    // 12. Seed ApprovalWorkflows & ApprovalSteps
    const workflowCompleted = await ApprovalWorkflow.create({
      projectId: 1,
      phaseTrigger: 'Design→Approval',
      name: 'NEOM Spine Phase Transition Gate: Design ➔ Approval',
      status: 'Approved'
    });

    await ApprovalStep.bulkCreate([
      { workflowId: workflowCompleted.id, stepOrder: 1, approverId: userMap['pm.buildings@industrial-project.com'], approverRole: 'Project Manager', status: 'Approved', comments: 'Structural canopy loading calculations verified.', actionedAt: '2026-07-15T10:00:00.000Z' }
    ]);

    // Active pending workflow for PMO Director review
    const workflowPending = await ApprovalWorkflow.create({
      projectId: 4,
      phaseTrigger: 'Approval→Execution',
      name: 'Diriyah Gate Substation Phase Gate: Approval ➔ Execution',
      status: 'Pending'
    });

    await ApprovalStep.bulkCreate([
      {
        workflowId: workflowPending.id,
        stepOrder: 1,
        approverId: userMap['pm.buildings@industrial-project.com'],
        approverRole: 'Project Manager',
        status: 'Approved',
        comments: 'Easements cleared by municipal planning teams.',
        actionedAt: '2026-07-16T09:00:00.000Z'
      },
      {
        workflowId: workflowPending.id,
        stepOrder: 2,
        approverId: userMap['director@industrial-project.com'],
        approverRole: 'PMO Director',
        status: 'Pending',
        comments: null,
        actionedAt: null
      }
    ]);

    console.log('🌱 Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
};

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase();
}
