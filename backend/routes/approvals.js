const express = require('express');
const router = express.Router();
const { ApprovalWorkflow, ApprovalStep, Project, User, Employee } = require('../models');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

// @desc    Get all approval workflows (history)
// @route   GET /api/approvals
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const workflows = await ApprovalWorkflow.findAll({
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'clientName', 'currentPhase'] },
        {
          model: ApprovalStep,
          as: 'steps',
          include: [{ model: User, as: 'approverUser', attributes: ['id', 'name', 'avatarUrl'] }]
        }
      ],
      order: [['id', 'DESC'], [{ model: ApprovalStep, as: 'steps' }, 'stepOrder', 'ASC']]
    });
    res.json({ success: true, data: workflows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get pending approvals awaiting logged-in user action
// @route   GET /api/approvals/pending
// @access  Private
router.get('/pending', protect, async (req, res) => {
  try {
    // Find all workflows that are still Pending
    const workflows = await ApprovalWorkflow.findAll({
      where: { status: 'Pending' },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'clientName'] },
        {
          model: ApprovalStep,
          as: 'steps',
          include: [{ model: User, as: 'approverUser', attributes: ['id', 'name', 'avatarUrl'] }]
        }
      ],
      order: [['id', 'DESC'], [{ model: ApprovalStep, as: 'steps' }, 'stepOrder', 'ASC']]
    });

    const pendingMyAction = [];

    workflows.forEach(flow => {
      // Find the first step that is not Approved
      const steps = flow.steps || [];
      const currentActiveStep = steps.find(s => s.status === 'Pending' || s.status === 'Rejected');

      if (currentActiveStep) {
        // Check if the preceding steps are all approved
        const precedingSteps = steps.filter(s => s.stepOrder < currentActiveStep.stepOrder);
        const precedingAllApproved = precedingSteps.every(s => s.status === 'Approved');

        if (precedingAllApproved) {
          // Check if current user is the authorized approver
          const isUserMatch = currentActiveStep.approverId === req.user.id;
          const isRoleMatch = !currentActiveStep.approverId && currentActiveStep.approverRole === req.user.role;

          if (isUserMatch || isRoleMatch) {
            pendingMyAction.push({
              stepId: currentActiveStep.id,
              workflowId: flow.id,
              workflowName: flow.name,
              phaseTrigger: flow.phaseTrigger,
              stepOrder: currentActiveStep.stepOrder,
              projectName: flow.project?.name,
              clientName: flow.project?.clientName,
              projectId: flow.project?.id,
              approverRole: currentActiveStep.approverRole,
              status: currentActiveStep.status
            });
          }
        }
      }
    });

    res.json({ success: true, data: pendingMyAction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Action an approval step (Approve/Reject)
// @route   POST /api/approvals/:stepId/action
// @access  Private
router.post('/:stepId/action', protect, async (req, res) => {
  const { status, comments } = req.body; // status: 'Approved' or 'Rejected'

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide status as Approved or Rejected' });
  }

  try {
    const step = await ApprovalStep.findByPk(req.params.stepId, {
      include: [{ model: ApprovalWorkflow, as: 'workflow' }]
    });

    if (!step) {
      return res.status(404).json({ success: false, message: 'Approval step not found' });
    }

    // Verify authorization
    const isUserMatch = step.approverId === req.user.id;
    const isRoleMatch = !step.approverId && step.approverRole === req.user.role;

    if (!isUserMatch && !isRoleMatch) {
      return res.status(403).json({ success: false, message: 'You are not authorized to action this step' });
    }

    // Update Step
    await step.update({
      status,
      comments,
      actionedAt: new Date()
    });

    const workflow = step.workflow;
    const allSteps = await ApprovalStep.findAll({
      where: { workflowId: workflow.id },
      order: [['stepOrder', 'ASC']]
    });

    if (status === 'Rejected') {
      // Reject Workflow completely
      await workflow.update({ status: 'Rejected' });
    } else {
      // Check if this was the last step
      const isLastStep = step.stepOrder === allSteps[allSteps.length - 1].stepOrder;

      if (isLastStep) {
        // Approve Workflow completely
        await workflow.update({ status: 'Approved' });

        // Phase Transition Trigger: e.g. "Design→Approval" transitions project phase to "Approval"
        if (workflow.phaseTrigger && workflow.phaseTrigger.includes('→')) {
          const [, nextPhase] = workflow.phaseTrigger.split('→');
          const project = await Project.findByPk(workflow.projectId);
          if (project) {
            await project.update({ currentPhase: nextPhase });
          }
        }
      }
    }

    res.json({ success: true, message: `Step actioned: ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Trigger a new phase transition approval workflow
// @route   POST /api/approvals/trigger
// @access  Private
router.post('/trigger', protect, async (req, res) => {
  const { projectId, phaseTrigger, name, approverChain } = req.body;
  // approverChain is array: [{ approverRole: 'Project Manager' }, { approverId: 2, approverRole: 'PMO Director' }]

  if (!projectId || !phaseTrigger || !name || !approverChain || approverChain.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide all workflow parameters and approver chain' });
  }

  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const workflow = await ApprovalWorkflow.create({
      projectId,
      phaseTrigger,
      name,
      status: 'Pending'
    });

    const stepsData = approverChain.map((step, idx) => ({
      workflowId: workflow.id,
      stepOrder: idx + 1,
      approverId: step.approverId || null,
      approverRole: step.approverRole || null,
      status: 'Pending'
    }));

    await ApprovalStep.bulkCreate(stepsData);

    res.status(201).json({ success: true, message: 'Approval workflow triggered successfully', workflowId: workflow.id });
  } catch (error) {
    res.status(550).json({ success: false, message: error.message });
  }
});

// @desc    Add a discussion comment to a workflow
// @route   POST /api/approvals/:id/comment
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  const { commentText } = req.body;

  if (!commentText || !commentText.trim()) {
    return res.status(400).json({ success: false, message: 'Please provide commentText' });
  }

  try {
    const workflow = await ApprovalWorkflow.findByPk(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    let comments = [];
    try {
      comments = JSON.parse(workflow.discussionComments || '[]');
    } catch (e) {
      comments = [];
    }

    const newComment = {
      id: Date.now(),
      userName: req.user.name,
      userRole: req.user.role,
      commentText: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    comments.push(newComment);
    await workflow.update({
      discussionComments: JSON.stringify(comments)
    });

    res.json({ success: true, data: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
