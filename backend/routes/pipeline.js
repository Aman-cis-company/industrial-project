const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {
  PipelineSegment,
  PipelineAsset,
  InspectionLog,
  IncidentReport,
  MaintenanceRecord,
  Risk,
  ComplianceItem,
  Employee,
  User
} = require('../models');
const { protect } = require('../middleware/auth');

// Employee include helper
const employeeInclude = (asName) => ({
  model: Employee,
  as: asName,
  attributes: ['id', 'designation', 'department'],
  include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }]
});

// ==========================================
// 1. DASHBOARD SUMMARY ENDPOINT
// ==========================================
router.get('/dashboard-summary', protect, async (req, res) => {
  try {
    const today = new Date();

    // Total segments by status
    const segments = await PipelineSegment.findAll({
      attributes: ['status']
    });
    
    const segmentStatusCounts = {
      Operational: 0,
      UnderMaintenance: 0,
      ShutDown: 0,
      Critical: 0
    };
    
    segments.forEach(s => {
      if (segmentStatusCounts[s.status] !== undefined) {
        segmentStatusCounts[s.status]++;
      }
    });

    // Open incidents count (status: Reported, UnderInvestigation)
    const openIncidentsCount = await IncidentReport.count({
      where: {
        status: {
          [Op.in]: ['Reported', 'UnderInvestigation']
        }
      }
    });

    // Overdue inspections count (status = Overdue OR (status = Scheduled AND scheduledDate < today))
    const overdueInspectionsCount = await InspectionLog.count({
      where: {
        [Op.or]: [
          { status: 'Overdue' },
          {
            status: 'Scheduled',
            scheduledDate: { [Op.lt]: today }
          }
        ]
      }
    });

    // Overdue maintenance count (status = Overdue OR (status = Scheduled AND scheduledDate < today))
    const overdueMaintenanceCount = await MaintenanceRecord.count({
      where: {
        [Op.or]: [
          { status: 'Overdue' },
          {
            status: 'Scheduled',
            scheduledDate: { [Op.lt]: today }
          }
        ]
      }
    });

    // Compliance items expiring soon (next 30 days) and not compliant
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const complianceExpiringSoonCount = await ComplianceItem.count({
      where: {
        segmentId: { [Op.ne]: null },
        status: { [Op.ne]: 'Compliant' },
        dueDate: {
          [Op.lte]: thirtyDaysFromNow
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalSegments: segments.length,
        segmentStatusCounts,
        openIncidentsCount,
        overdueInspectionsCount,
        overdueMaintenanceCount,
        complianceExpiringSoonCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. SEGMENT FULL DETAILS ENDPOINT
// ==========================================
router.get('/segments/:id/full', protect, async (req, res) => {
  try {
    const segment = await PipelineSegment.findByPk(req.params.id, {
      include: [
        { model: PipelineAsset, as: 'assets' },
        { 
          model: InspectionLog, 
          as: 'inspections',
          include: [employeeInclude('inspector')]
        },
        { 
          model: IncidentReport, 
          as: 'incidents',
          include: [employeeInclude('reportedBy')]
        },
        { 
          model: MaintenanceRecord, 
          as: 'maintenanceRecords',
          include: [
            employeeInclude('technician'),
            { model: PipelineAsset, as: 'asset', attributes: ['id', 'name', 'assetType'] }
          ]
        },
        {
          model: Risk,
          as: 'risks',
          include: [employeeInclude('owner')]
        },
        {
          model: ComplianceItem,
          as: 'complianceItems'
        }
      ],
      order: [
        [{ model: InspectionLog, as: 'inspections' }, 'scheduledDate', 'DESC'],
        [{ model: IncidentReport, as: 'incidents' }, 'reportedAt', 'DESC'],
        [{ model: MaintenanceRecord, as: 'maintenanceRecords' }, 'scheduledDate', 'DESC']
      ]
    });

    if (!segment) {
      return res.status(404).json({ success: false, message: 'Pipeline segment not found' });
    }

    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. CRUD FOR PIPELINE SEGMENTS
// ==========================================
router.get('/segments', protect, async (req, res) => {
  try {
    const segments = await PipelineSegment.findAll({
      include: [
        { model: IncidentReport, as: 'incidents', attributes: ['id', 'status', 'severity'] },
        { model: InspectionLog, as: 'inspections', attributes: ['id', 'completedDate', 'status'] }
      ]
    });
    res.json({ success: true, data: segments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/segments/:id', protect, async (req, res) => {
  try {
    const segment = await PipelineSegment.findByPk(req.params.id);
    if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' });
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/segments', protect, async (req, res) => {
  try {
    const segment = await PipelineSegment.create(req.body);
    res.status(201).json({ success: true, data: segment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/segments/:id', protect, async (req, res) => {
  try {
    const segment = await PipelineSegment.findByPk(req.params.id);
    if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' });
    await segment.update(req.body);
    res.json({ success: true, data: segment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/segments/:id', protect, async (req, res) => {
  try {
    const segment = await PipelineSegment.findByPk(req.params.id);
    if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' });
    await segment.destroy();
    res.json({ success: true, message: 'Segment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. CRUD FOR PIPELINE ASSETS
// ==========================================
router.get('/assets', protect, async (req, res) => {
  try {
    const { segmentId } = req.query;
    const where = {};
    if (segmentId) where.segmentId = segmentId;
    
    const assets = await PipelineAsset.findAll({
      where,
      include: [{ model: PipelineSegment, as: 'segment', attributes: ['id', 'name'] }]
    });
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/assets/:id', protect, async (req, res) => {
  try {
    const asset = await PipelineAsset.findByPk(req.params.id, {
      include: [{ model: PipelineSegment, as: 'segment', attributes: ['id', 'name'] }]
    });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/assets', protect, async (req, res) => {
  try {
    const asset = await PipelineAsset.create(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/assets/:id', protect, async (req, res) => {
  try {
    const asset = await PipelineAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    await asset.update(req.body);
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/assets/:id', protect, async (req, res) => {
  try {
    const asset = await PipelineAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    await asset.destroy();
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. CRUD FOR INSPECTION LOGS
// ==========================================
router.get('/inspections', protect, async (req, res) => {
  try {
    const { segmentId } = req.query;
    const where = {};
    if (segmentId) where.segmentId = segmentId;

    const logs = await InspectionLog.findAll({
      where,
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        employeeInclude('inspector')
      ],
      order: [['scheduledDate', 'DESC']]
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inspections/:id', protect, async (req, res) => {
  try {
    const log = await InspectionLog.findByPk(req.params.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        employeeInclude('inspector')
      ]
    });
    if (!log) return res.status(404).json({ success: false, message: 'Inspection log not found' });
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/inspections', protect, async (req, res) => {
  try {
    const log = await InspectionLog.create(req.body);
    const fullLog = await InspectionLog.findByPk(log.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        employeeInclude('inspector')
      ]
    });
    res.status(201).json({ success: true, data: fullLog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/inspections/:id', protect, async (req, res) => {
  try {
    const log = await InspectionLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Inspection log not found' });
    await log.update(req.body);
    const fullLog = await InspectionLog.findByPk(log.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        employeeInclude('inspector')
      ]
    });
    res.json({ success: true, data: fullLog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/inspections/:id', protect, async (req, res) => {
  try {
    const log = await InspectionLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Inspection log not found' });
    await log.destroy();
    res.json({ success: true, message: 'Inspection log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 6. CRUD FOR INCIDENT REPORTS
// ==========================================
router.get('/incidents', protect, async (req, res) => {
  try {
    const { segmentId } = req.query;
    const where = {};
    if (segmentId) where.segmentId = segmentId;

    const incidents = await IncidentReport.findAll({
      where,
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        employeeInclude('reportedBy')
      ],
      order: [['reportedAt', 'DESC']]
    });
    res.json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/incidents/:id', protect, async (req, res) => {
  try {
    const incident = await IncidentReport.findByPk(req.params.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        employeeInclude('reportedBy')
      ]
    });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident report not found' });
    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/incidents', protect, async (req, res) => {
  try {
    const incident = await IncidentReport.create(req.body);
    const fullIncident = await IncidentReport.findByPk(incident.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        employeeInclude('reportedBy')
      ]
    });
    res.status(201).json({ success: true, data: fullIncident });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/incidents/:id', protect, async (req, res) => {
  try {
    const incident = await IncidentReport.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident report not found' });
    await incident.update(req.body);
    const fullIncident = await IncidentReport.findByPk(incident.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        employeeInclude('reportedBy')
      ]
    });
    res.json({ success: true, data: fullIncident });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/incidents/:id', protect, async (req, res) => {
  try {
    const incident = await IncidentReport.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident report not found' });
    await incident.destroy();
    res.json({ success: true, message: 'Incident report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 7. CRUD FOR MAINTENANCE RECORDS
// ==========================================
router.get('/maintenance', protect, async (req, res) => {
  try {
    const { segmentId, assetId } = req.query;
    const where = {};
    if (segmentId) where.segmentId = segmentId;
    if (assetId) where.assetId = assetId;

    const maintenance = await MaintenanceRecord.findAll({
      where,
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        { model: PipelineAsset, as: 'asset', attributes: ['id', 'name', 'assetType'] },
        employeeInclude('technician')
      ],
      order: [['scheduledDate', 'DESC']]
    });
    res.json({ success: true, data: maintenance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/maintenance/:id', protect, async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByPk(req.params.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        { model: PipelineAsset, as: 'asset', attributes: ['id', 'name', 'assetType'] },
        employeeInclude('technician')
      ]
    });
    if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/maintenance', protect, async (req, res) => {
  try {
    const record = await MaintenanceRecord.create(req.body);
    const fullRecord = await MaintenanceRecord.findByPk(record.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        { model: PipelineAsset, as: 'asset', attributes: ['id', 'name', 'assetType'] },
        employeeInclude('technician')
      ]
    });
    res.status(201).json({ success: true, data: fullRecord });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/maintenance/:id', protect, async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    await record.update(req.body);
    const fullRecord = await MaintenanceRecord.findByPk(record.id, {
      include: [
        { model: PipelineSegment, as: 'segment', attributes: ['id', 'name', 'region'] },
        { model: PipelineAsset, as: 'asset', attributes: ['id', 'name', 'assetType'] },
        employeeInclude('technician')
      ]
    });
    res.json({ success: true, data: fullRecord });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/maintenance/:id', protect, async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    await record.destroy();
    res.json({ success: true, message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
