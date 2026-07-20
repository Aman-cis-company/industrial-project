const { User, Employee, Project, ProjectTeamMember, Task, Milestone, Document, Risk, ComplianceItem, Approval, ApprovalWorkflow, ApprovalStep, Client, Proposal, PipelineSegment, PipelineAsset, InspectionLog, IncidentReport, MaintenanceRecord, sequelize } = require('../models');

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
      { companyName: 'GAIL (India) Limited', industry: 'Infrastructure & Energy Transmission', contactPersonName: 'Aarav Sharma', contactEmail: 'aarav.sharma@gail.co.in', contactPhone: '+91-11-2617-2580', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'Indian Oil Corporation (IOCL)', industry: 'Oil & Gas / Refining', contactPersonName: 'Rajesh Kumar', contactEmail: 'rajesh.kumar@indianoil.in', contactPhone: '+91-22-2644-7600', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'Oil and Natural Gas Corporation (ONGC)', industry: 'Energy exploration & Subsea', contactPersonName: 'Sarah Thomas', contactEmail: 'sarah.thomas@ongc.co.in', contactPhone: '+91-11-2675-0111', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'Delhi Jal Board (DJB)', industry: 'Utilities / Water Management', contactPersonName: 'Manish Verma', contactEmail: 'manish.verma@djb.gov.in', contactPhone: '+91-11-2351-1600', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'Reliance Industries Limited (RIL)', industry: 'Real Estate & Energy Infrastructure', contactPersonName: 'Amit Shah', contactEmail: 'amit.shah@ril.com', contactPhone: '+91-22-3555-5000', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'DLF Limited', industry: 'Commercial Real Estate', contactPersonName: 'Vikram Sethi', contactEmail: 'vikram.sethi@dlf.in', contactPhone: '+91-124-439-6000', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'National Health Authority (NHA)', industry: 'Healthcare & Public Welfare', contactPersonName: 'Dr. Neha Gupta', contactEmail: 'neha.gupta@nha.gov.in', contactPhone: '+91-11-2346-2600', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'Tata Power', industry: 'Utilities / Power Distribution', contactPersonName: 'Faisal Khan', contactEmail: 'faisal.khan@tatapower.com', contactPhone: '+91-22-6717-1000', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'Mumbai Metropolitan Region Development Authority (MMRDA)', industry: 'Urban Planning / Transit', contactPersonName: 'Sanjay Joshi', contactEmail: 'sanjay.joshi@mmrda.maharashtra.gov.in', contactPhone: '+91-22-2659-4000', country: 'India', relationshipStatus: 'Active' },
      { companyName: 'Larsen & Toubro (L&T)', industry: 'EPC Engineering', contactPersonName: 'Hrishikesh Kulkarni', contactEmail: 'hrishikesh.kulkarni@lntecc.com', contactPhone: '+91-22-6705-0505', country: 'India', relationshipStatus: 'Prospect' },
      { companyName: 'Bharat Petroleum (BPCL)', industry: 'Energy / Petroleum Refining', contactPersonName: 'Suresh Menon', contactEmail: 'suresh.menon@bharatpetroleum.in', contactPhone: '+91-22-2271-3000', country: 'India', relationshipStatus: 'Prospect' }
    ];

    const clients = await Client.bulkCreate(clientsData);
    console.log(`✔️ Seeded ${clients.length} CRM Clients.`);

    // 4. Create Projects (clientName matches Client companyNames to link dynamically)
    const projectsData = [
      { name: 'GAIL Hazira-Vijaipur-Jagdishpur (HVJ) Pipeline Expansion', clientName: 'GAIL (India) Limited', serviceCategory: 'PowerTransmissionDistribution', description: 'Detailed expansion design of the major trunk line and control valves.', budget: 45000000.00, budgetSpent: 12500000.00, startDate: '2026-01-10', endDate: '2027-12-30', currentPhase: 'Execution', status: 'OnTrack', projectManagerId: 3 },
      { name: 'IOCL Koyali Refinery Chilled Water HVAC Refit', clientName: 'Indian Oil Corporation (IOCL)', serviceCategory: 'HeatingCooling', description: 'Upgrading the chilled water layout and refinery air processing blocks.', budget: 8400000.00, budgetSpent: 6200000.00, startDate: '2025-06-01', endDate: '2026-09-30', currentPhase: 'Execution', status: 'AtRisk', projectManagerId: 3 },
      { name: 'ONGC KG Basin Subsea Grid Substation Integration', clientName: 'Oil and Natural Gas Corporation (ONGC)', serviceCategory: 'Buildings', description: 'Concealed layout designs for remote underwater operations.', budget: 18200000.00, budgetSpent: 14900000.00, startDate: '2025-08-15', endDate: '2026-11-20', currentPhase: 'Execution', status: 'Delayed', projectManagerId: 3 },
      { name: 'Chennai Minjur Desalination Plant Expansion Layout', clientName: 'Delhi Jal Board (DJB)', serviceCategory: 'WaterTreatment', description: 'Desalination piping structural support layouts.', budget: 35000000.00, budgetSpent: 4200000.00, startDate: '2026-05-01', endDate: '2028-06-15', currentPhase: 'Design', status: 'OnTrack', projectManagerId: 4 },
      { name: 'Yamuna Action Plan Phase 3 Wastewater Plant', clientName: 'National Health Authority (NHA)', serviceCategory: 'WastewaterTreatment', description: 'Activated biological sludge process engineering.', budget: 52000000.00, budgetSpent: 28300000.00, startDate: '2025-03-01', endDate: '2027-02-28', currentPhase: 'Execution', status: 'OnTrack', projectManagerId: 4 },
      { name: 'DLF CyberCity Phase 3 Fire Mains Layout', clientName: 'DLF Limited', serviceCategory: 'InteriorDesign', description: 'Detailed custom piping and pressure safety bypass layouts.', budget: 6800000.00, budgetSpent: 2100000.00, startDate: '2026-02-01', endDate: '2026-12-15', currentPhase: 'Approval', status: 'OnTrack', projectManagerId: 6 }
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
    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.companyName] = c.id;
    });

    const proposalsData = [
      { clientId: clientMap['Delhi Jal Board (DJB)'], title: 'Delhi Jal Board Okhla Wastewater Treatment Plant Extension', serviceCategory: 'WastewaterTreatment', estimatedValue: 12400000.00, status: 'Negotiation', createdById: 3, sentDate: '2026-05-15', decisionDate: null },
      { clientId: clientMap['Reliance Industries Limited (RIL)'], title: 'RIL Jamnagar Solar Array Storage Containment', serviceCategory: 'PowerTransmissionDistribution', estimatedValue: 4800000.00, status: 'Sent', createdById: 4, sentDate: '2026-06-10', decisionDate: null },
      { clientId: clientMap['DLF Limited'], title: 'DLF CyberCity Phase 4 BIM Coordination Contract', serviceCategory: 'BIM', estimatedValue: 6500000.00, status: 'Won', createdById: 3, sentDate: '2026-03-01', decisionDate: '2026-04-15' },
      { clientId: clientMap['Larsen & Toubro (L&T)'], title: 'L&T Mumbai Metro Line 4 Digital Twin Models', serviceCategory: 'BIM', estimatedValue: 3200000.00, status: 'Draft', createdById: 9, sentDate: null, decisionDate: null },
      { clientId: clientMap['GAIL (India) Limited'], title: 'GAIL HVJ Structural Loop Segment Analysis', serviceCategory: 'Buildings', estimatedValue: 18500000.00, status: 'Negotiation', createdById: 3, sentDate: '2026-06-18', decisionDate: null },
      { clientId: clientMap['National Health Authority (NHA)'], title: 'NHA Apollo Hospital Isolation Units Engineering', serviceCategory: 'Healthcare', estimatedValue: 7200000.00, status: 'Sent', createdById: 5, sentDate: '2026-07-02', decisionDate: null },
      { clientId: clientMap['Oil and Natural Gas Corporation (ONGC)'], title: 'ONGC Dehradun HQ Geothermal HVAC Upgrade', serviceCategory: 'HeatingCooling', estimatedValue: 9800000.00, status: 'Won', createdById: 3, sentDate: '2026-04-20', decisionDate: '2026-06-01' },
      { clientId: clientMap['Mumbai Metropolitan Region Development Authority (MMRDA)'], title: 'MMRDA Thane Canal Gravity Expansions', serviceCategory: 'WastewaterTreatment', estimatedValue: 14500000.00, status: 'Lost', createdById: 4, sentDate: '2026-02-15', decisionDate: '2026-04-30' },
      { clientId: clientMap['Indian Oil Corporation (IOCL)'], title: 'IOCL Koyali Refinery District Chilled Loop Overhaul', serviceCategory: 'HeatingCooling', estimatedValue: 24000000.00, status: 'Negotiation', createdById: 3, sentDate: '2026-06-01', decisionDate: null },
      { clientId: clientMap['GAIL (India) Limited'], title: 'GAIL Vijaipur Utility Pressure Loop Zoning', serviceCategory: 'UrbanPlanning', estimatedValue: 8600000.00, status: 'Won', createdById: 4, sentDate: '2026-01-10', decisionDate: '2026-02-28' },
      { clientId: clientMap['Bharat Petroleum (BPCL)'], title: 'BPCL Mumbai Refinery Substation Cabling Models', serviceCategory: 'PowerTransmissionDistribution', estimatedValue: 11000000.00, status: 'Draft', createdById: 8, sentDate: null, decisionDate: null },
      { clientId: clientMap['Tata Power'], title: 'Tata Power Delhi Substation Modular Grid Extensions', serviceCategory: 'BIM', estimatedValue: 5300000.00, status: 'Draft', createdById: 9, sentDate: null, decisionDate: null }
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

    // 13. Seed Pipeline Segments
    // 13. Seed Pipeline Segments
    const segmentsData = [
      {
        name: 'Mumbai High to Uran Sweet Crude Trunkline',
        region: 'Western Region',
        segmentType: 'Transmission',
        material: 'Carbon Steel (API 5L X70)',
        diameterInches: 36.0,
        designPressure: 1200.0,
        installDate: '2015-04-12',
        status: 'Operational',
        latStart: 18.97,
        lngStart: 72.82,
        latEnd: 18.88,
        lngEnd: 72.94,
        description: 'Primary offshore crude line routing sweet crude to Uran terminal facilities.'
      },
      {
        name: 'KG Basin Deepwater Gas Gathering Pipeline',
        region: 'Southern Region',
        segmentType: 'Gathering',
        material: 'High-yield Carbon Steel',
        diameterInches: 24.0,
        designPressure: 950.0,
        installDate: '2018-08-20',
        status: 'UnderMaintenance',
        latStart: 16.50,
        lngStart: 82.20,
        latEnd: 16.35,
        lngEnd: 82.05,
        description: 'Deepwater gas gathering lines in Krishna Godavari basin feeding onshore terminal.'
      },
      {
        name: 'Hazira-Vijaipur Gas Trunkline Segment A',
        region: 'Western Region',
        segmentType: 'Transmission',
        material: 'Carbon Steel',
        diameterInches: 42.0,
        designPressure: 1400.0,
        installDate: '2010-02-18',
        status: 'Critical',
        latStart: 21.17,
        lngStart: 72.68,
        latEnd: 24.12,
        lngEnd: 77.20,
        description: 'High-pressure trunk segment of the HVJ gas pipeline network showing wall thinning.'
      },
      {
        name: 'Vijaipur-Jagdishpur Mainloop Segment B',
        region: 'Northern Region',
        segmentType: 'Transmission',
        material: 'Carbon Steel (API 5L)',
        diameterInches: 30.0,
        designPressure: 1050.0,
        installDate: '2016-07-01',
        status: 'Operational',
        latStart: 24.12,
        lngStart: 77.20,
        latEnd: 26.44,
        lngEnd: 81.50,
        description: 'Primary transmission loop supply routing natural gas to northern fertilizer units.'
      },
      {
        name: 'Koyali Refinery Supply Bypass Link',
        region: 'Western Region',
        segmentType: 'Distribution',
        material: 'Polyethylene (PE100)',
        diameterInches: 8.0,
        designPressure: 150.0,
        installDate: '2023-01-10',
        status: 'Operational',
        latStart: 22.35,
        lngStart: 73.12,
        latEnd: 22.42,
        lngEnd: 73.20,
        description: 'High-pressure crude oil supply bypass for Vadodara refinery feedstocks.'
      },
      {
        name: 'Delhi City Gas Distribution Grid Loop 1',
        region: 'Northern Region',
        segmentType: 'Distribution',
        material: 'High-Density Polyethylene',
        diameterInches: 12.0,
        designPressure: 350.0,
        installDate: '2021-11-05',
        status: 'Operational',
        latStart: 28.61,
        lngStart: 77.20,
        latEnd: 28.70,
        lngEnd: 77.30,
        description: 'City gas distribution mains routing compressed gas to public utility units.'
      },
      {
        name: 'Kochi-Mangaluru Coastal LNG Pipeline',
        region: 'Southern Region',
        segmentType: 'Transmission',
        material: 'Carbon Steel',
        diameterInches: 28.0,
        designPressure: 900.0,
        installDate: '2012-09-15',
        status: 'ShutDown',
        latStart: 9.93,
        lngStart: 76.26,
        latEnd: 12.87,
        lngEnd: 74.88,
        description: 'Cross-country transmission segment routing LNG feedstocks through coastal Karnataka.'
      },
      {
        name: 'Barauni-Guwahati Clean Energy Trunkline',
        region: 'Eastern Region',
        segmentType: 'Transmission',
        material: 'API 5L Grade B Steel',
        diameterInches: 24.0,
        designPressure: 800.0,
        installDate: '2019-03-24',
        status: 'Operational',
        latStart: 25.40,
        lngStart: 85.98,
        latEnd: 26.15,
        lngEnd: 91.75,
        description: 'Transmission loop expanding cleaner energy access across eastern states.'
      },
      {
        name: 'Chennai Desalination Water Main Loop A',
        region: 'Southern Region',
        segmentType: 'Transmission',
        material: 'Super Duplex Stainless Steel',
        diameterInches: 48.0,
        designPressure: 1500.0,
        installDate: '2025-05-15',
        status: 'Operational',
        latStart: 13.08,
        lngStart: 80.27,
        latEnd: 13.20,
        lngEnd: 80.35,
        description: 'Clean water trunk routing fresh water outputs from Minjur plant to Chennai grid.'
      },
      {
        name: 'Vizag Port LNG Import Feedline',
        region: 'Southern Region',
        segmentType: 'Gathering',
        material: 'Carbon Steel (API 5L X65)',
        diameterInches: 18.0,
        designPressure: 750.0,
        installDate: '2017-10-12',
        status: 'Operational',
        latStart: 17.68,
        lngStart: 83.21,
        latEnd: 17.80,
        lngEnd: 83.35,
        description: 'Cryogenic transmission segment feeding LNG from harbor terminal to Vizag steel plant.'
      },
      {
        name: 'Jamnagar Refinery Heavy Crude Mainline',
        region: 'Western Region',
        segmentType: 'Transmission',
        material: 'Nickel-alloy Steel (Cryogenic)',
        diameterInches: 20.0,
        designPressure: 1100.0,
        installDate: '2022-03-30',
        status: 'UnderMaintenance',
        latStart: 22.47,
        lngStart: 70.07,
        latEnd: 22.38,
        lngEnd: 69.90,
        description: 'Heavy crude mainline routing oil products to Jamnagar marine terminals.'
      },
      {
        name: 'Naharkatiya Crude Gathering Network Segment 4',
        region: 'Eastern Region',
        segmentType: 'Transmission',
        material: 'Carbon Steel (API 5L X80)',
        diameterInches: 48.0,
        designPressure: 1600.0,
        installDate: '2014-06-25',
        status: 'Operational',
        latStart: 27.28,
        lngStart: 95.35,
        latEnd: 27.42,
        lngEnd: 95.50,
        description: 'Historic crude gathering and transmission line routing crude to Digboi refinery.'
      },
      {
        name: 'Kolkata Municipal PE Gas Distribution Link',
        region: 'Eastern Region',
        segmentType: 'Gathering',
        material: 'Carbon Steel (Sour Gas Grade)',
        diameterInches: 16.0,
        designPressure: 1200.0,
        installDate: '2020-02-14',
        status: 'Operational',
        latStart: 22.57,
        lngStart: 88.36,
        latEnd: 22.65,
        lngEnd: 88.45,
        description: 'Polyethylene gas distribution grid serving commercial hubs in Salt Lake region.'
      },
      {
        name: 'Yamuna River Crossing Utilities Corridor',
        region: 'Northern Region',
        segmentType: 'Distribution',
        material: 'PE100 Black Polyethylene',
        diameterInches: 10.0,
        designPressure: 250.0,
        installDate: '2021-06-18',
        status: 'Operational',
        latStart: 28.58,
        lngStart: 77.25,
        latEnd: 28.59,
        lngEnd: 77.29,
        description: 'Reinforced concrete utility crossing carrying potable mains under the river bed.'
      },
      {
        name: 'Uran LPG Processing Bypass Line',
        region: 'Western Region',
        segmentType: 'Distribution',
        material: 'Ductile Iron (Cement Lined)',
        diameterInches: 24.0,
        designPressure: 450.0,
        installDate: '2024-08-01',
        status: 'Operational',
        latStart: 18.88,
        lngStart: 72.94,
        latEnd: 18.80,
        lngEnd: 72.85,
        description: 'Refinery bypass supplying LPG directly to Mumbai local bottling terminals.'
      }
    ];

    const segments = await PipelineSegment.bulkCreate(segmentsData);
    console.log(`✔️ Seeded ${segments.length} Pipeline Segments.`);

    // 14. Seed Pipeline Assets
    const assetsData = [];
    const assetTypes = ['Valve', 'Station', 'PumpUnit', 'Sensor'];
    const assetNamesMap = {
      'Valve': ['Main Isolation Valve', 'ESD Gate Valve', 'Check Valve', 'Flow Control Valve'],
      'Station': ['Pressure Regulating Station', 'Compressor Station', 'Flow Metering Station', 'Pig Launcher/Receiver'],
      'PumpUnit': ['Booster Pump A', 'Centrifugal Pump Unit 1', 'Main Turbine Pump B', 'Reciprocating Pump Unit'],
      'Sensor': ['Inlet Pressure Transmitter', 'Outlet Temperature Sensor', 'Ultrasonic Flow Meter', 'Cathodic Protection Rectifier']
    };

    segments.forEach((seg, idx) => {
      // Create 3 assets for each segment
      for (let i = 1; i <= 3; i++) {
        const type = assetTypes[(idx + i) % 4];
        const names = assetNamesMap[type];
        const name = `${seg.name.split(' ')[0]} ${names[i % names.length]} ${i}`;
        assetsData.push({
          segmentId: seg.id,
          assetType: type,
          name: name,
          installDate: seg.installDate,
          lastServiceDate: '2026-02-15',
          status: seg.status === 'Critical' ? 'UnderMaintenance' : 'Operational'
        });
      }
    });

    const assets = await PipelineAsset.bulkCreate(assetsData);
    console.log(`✔️ Seeded ${assets.length} Pipeline Assets.`);

    // 15. Seed Inspection Logs
    const inspectionLogsData = [];
    segments.forEach((seg, idx) => {
      // Completed inspection
      inspectionLogsData.push({
        segmentId: seg.id,
        inspectorId: 9, // Priya Patel
        scheduledDate: '2026-06-10',
        completedDate: '2026-06-10',
        status: 'Completed',
        checklistData: {
          cathodicProtectionCheck: 'Pass',
          corrosionInspection: 'Negligible',
          leakPresence: 'None Detected',
          valveOperation: 'Verified Smooth',
          rightOfWayCleared: 'Yes'
        },
        notes: `Inspection completed successfully. Coating condition checked. Cathodic potential readouts are within normal tolerances of -850mV to -1200mV.`,
        attachmentUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500']
      });

      // Scheduled inspection (upcoming)
      inspectionLogsData.push({
        segmentId: seg.id,
        inspectorId: 9, // Priya Patel
        scheduledDate: '2026-08-15',
        completedDate: null,
        status: 'Scheduled',
        checklistData: null,
        notes: `Routine bi-monthly integrity walk and sensor calibration schedule.`,
        attachmentUrls: null
      });

      // Overdue inspection (for demo realism, let's create a few overdue ones)
      if (idx % 4 === 1) {
        inspectionLogsData.push({
          segmentId: seg.id,
          inspectorId: 9, // Priya Patel
          scheduledDate: '2026-07-01',
          completedDate: null,
          status: 'Overdue',
          checklistData: null,
          notes: `High urgency thickness profiling scan delayed due to dust storms. Need to reschedule immediately.`,
          attachmentUrls: null
        });
      }
    });

    await InspectionLog.bulkCreate(inspectionLogsData);
    console.log(`✔️ Seeded Inspection Logs.`);

    // 16. Seed Incident Reports
    const incidentReportsData = [
      {
        segmentId: segments[3].id, // Abqaiq Critical Loop
        reportedById: 7, // Mei Tanaka
        title: 'Cathodic Protection Voltage Drop',
        description: 'Cathodic protection system rectifier reported voltage below -850mV, indicating possible local coating breach or interference. Visual inspection shows signs of galvanic interaction.',
        severity: 'High',
        status: 'UnderInvestigation',
        latitude: 25.90,
        longitude: 49.64,
        reportedAt: '2026-07-14T08:30:00.000Z',
        resolvedAt: null
      },
      {
        segmentId: segments[1].id, // Ghawar Gas Gathering
        reportedById: 7, // Mei Tanaka
        title: 'Right-of-Way Construction Encroachment',
        description: 'Unauthorized excavation equipment spotted within the 15-meter safety buffer zone of the gathering line pipeline. Site foreman instructed to cease operations immediately.',
        severity: 'Medium',
        status: 'Reported',
        latitude: 25.48,
        longitude: 49.65,
        reportedAt: '2026-07-16T14:15:00.000Z',
        resolvedAt: null
      },
      {
        segmentId: segments[6].id, // Rabigh Gas Import Segment (Index 6)
        reportedById: 7, // Mei Tanaka
        title: 'Minor Gas Seep Near Flange Valve 2',
        description: 'Pin-hole gas leak detected during regular sniffing walk at the flange inlet. Pressure levels stable, segment successfully isolated.',
        severity: 'Critical',
        status: 'Resolved',
        latitude: 22.80,
        longitude: 39.06,
        reportedAt: '2026-07-05T11:00:00.000Z',
        resolvedAt: '2026-07-06T17:30:00.000Z'
      }
    ];

    await IncidentReport.bulkCreate(incidentReportsData);
    console.log(`✔️ Seeded Incident Reports.`);

    // 17. Seed Maintenance Records
    const maintenanceRecordsData = [];
    // Assign some maintenance to assets and some to segments directly
    assets.slice(0, 15).forEach((asset, idx) => {
      // Completed maintenance
      maintenanceRecordsData.push({
        assetId: asset.id,
        segmentId: null,
        technicianId: 8, // Carlos Mendez
        maintenanceType: 'Preventive',
        scheduledDate: '2026-06-15',
        completedDate: '2026-06-15',
        status: 'Completed',
        workPerformed: 'Valve greasing, gasket check, actuators verified fully operational.',
        nextDueDate: '2026-12-15'
      });

      // Scheduled maintenance
      maintenanceRecordsData.push({
        assetId: asset.id,
        segmentId: null,
        technicianId: 8,
        maintenanceType: 'Preventive',
        scheduledDate: '2026-08-20',
        completedDate: null,
        status: 'Scheduled',
        workPerformed: 'Routine calibration of transmitters and valve packing torque tests.',
        nextDueDate: null
      });

      // Overdue maintenance
      if (idx % 3 === 0) {
        maintenanceRecordsData.push({
          assetId: asset.id,
          segmentId: null,
          technicianId: 8,
          maintenanceType: 'Corrective',
          scheduledDate: '2026-07-05',
          completedDate: null,
          status: 'Overdue',
          workPerformed: 'Acoustic emissions transducer replacement due to signal dropouts.',
          nextDueDate: null
        });
      }
    });

    // Segment direct maintenance
    segments.slice(0, 5).forEach((seg, idx) => {
      maintenanceRecordsData.push({
        assetId: null,
        segmentId: seg.id,
        technicianId: 8,
        maintenanceType: 'Preventive',
        scheduledDate: '2026-07-28',
        completedDate: null,
        status: 'Scheduled',
        workPerformed: 'Cathodic protection rectifier groundbed soil watering and voltage reading validation.',
        nextDueDate: null
      });
    });

    await MaintenanceRecord.bulkCreate(maintenanceRecordsData);
    console.log(`✔️ Seeded Maintenance Records.`);

    // 18. Seed Pipeline compliance items
    const pipelineCompliance = [
      {
        segmentId: segments[0].id, // Dammam-Dhahran
        requirementName: 'Environmental Impact Assessment (EIA) Approval',
        applicableServiceCategory: 'Environmental Clearance',
        status: 'Compliant',
        dueDate: '2028-04-12',
        notes: 'EIA certificate issued by Environmental Authority. Valid for 10 years.'
      },
      {
        segmentId: segments[3].id, // Abqaiq Critical Loop
        requirementName: 'ASME B31.4 Pressure Test Certification',
        applicableServiceCategory: 'Safety Certification',
        status: 'NonCompliant',
        dueDate: '2026-08-01',
        notes: 'Hydrostatic pressure cert is nearing expiry. Wall thinning requires remediation prior to safety certificate renewal.'
      },
      {
        segmentId: segments[1].id, // Ghawar Gathering
        requirementName: 'Ministry of Energy Right-of-Way Permit',
        applicableServiceCategory: 'Regulatory Permit',
        status: 'InProgress',
        dueDate: '2026-09-15',
        notes: 'Renewal application filed. Under review at regulatory desk.'
      },
      {
        segmentId: segments[8].id, // NEOM Spine Water Main
        requirementName: 'Safety Operations & Integrity Management Certification',
        applicableServiceCategory: 'Safety Certification',
        status: 'Compliant',
        dueDate: '2027-05-15',
        notes: 'Integrity systems commissioned and certified.'
      }
    ];

    await ComplianceItem.bulkCreate(pipelineCompliance);
    console.log(`✔️ Seeded Pipeline Compliance Items.`);

    // 19. Seed Pipeline Risks
    const pipelineRisks = [
      {
        segmentId: segments[3].id, // Abqaiq Critical Loop
        title: 'External Coating Degradation & Crevice Corrosion',
        description: 'Localized corrosion spots detected via smart pigging run. Soil conductivity is high in this section.',
        category: 'Safety',
        probability: 4,
        impact: 5,
        riskScore: 20,
        status: 'Open',
        mitigationPlan: 'Schedule sleeve reinforcement welding and replace surrounding anode beds during upcoming shut down.',
        ownerId: 8, // Carlos Mendez
        identifiedDate: '2026-06-20'
      },
      {
        segmentId: segments[1].id, // Ghawar Gas Gathering
        title: 'Third Party Excavation Damage',
        description: 'Ongoing commercial warehouse construction nearby presents danger of mechanical line strikes.',
        category: 'Regulatory',
        probability: 3,
        impact: 4,
        riskScore: 12,
        status: 'Mitigating',
        mitigationPlan: 'Install concrete warning slabs above pipeline centerline, place warning signs, and double frequency of helicopter flyovers.',
        ownerId: 9, // Priya Patel
        identifiedDate: '2026-07-02'
      }
    ];

    await Risk.bulkCreate(pipelineRisks);
    console.log(`✔️ Seeded Pipeline Risks.`);

    console.log('🌱 Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
};

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase();
}
