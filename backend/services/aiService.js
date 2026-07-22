const { Project, Task, Risk, Client, ComplianceItem } = require('../models');

/**
 * AI Service Layer - abstracts OpenAI or other LLM APIs.
 * Includes a context-aware semantic query processor that queries the database
 * to provide real responses in demo mode.
 */
class AIService {
  /**
   * Generates a natural-language executive summary of a project's parameters.
   */
  async generateProjectSummary(project) {
    try {
      // If VITE_OPENAI_API_KEY is configured in .env, we can call the actual OpenAI API
      if (process.env.OPENAI_API_KEY) {
        // Real LLM call placeholder
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const prompt = `Summarize the status of this engineering project:
          Name: ${project.name}
          Client: ${project.clientName}
          Phase: ${project.currentPhase}
          Status: ${project.status}
          Budget: SAR ${project.budget}
          Spent: SAR ${project.budgetSpent}
          Tasks count: ${project.tasks?.length || 0}
          Risks count: ${project.risks?.length || 0}
          
          Provide a professional, concise executive summary (3-4 sentences) outlining financial burn, milestone progress, and critical risks.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        });
        return completion.choices[0].message.content.trim();
      }
    } catch (e) {
      console.warn('Real LLM API call failed, falling back to local heuristic summary.', e.message);
    }

    // Heuristic Context-Aware Fallback
    const budgetPct = Math.round((parseFloat(project.budgetSpent || 0) / parseFloat(project.budget || 1)) * 100);
    const activeTasks = project.tasks?.filter(t => t.status !== 'Done') || [];
    const openRisks = project.risks?.filter(r => r.status !== 'Closed') || [];
    
    let summaryText = `The **${project.name}** contract for **${project.clientName}** is currently in the **${project.currentPhase}** phase and is flagged as **${project.status}**. `;
    
    if (project.status === 'OnTrack') {
      summaryText += `Financially, the project remains highly efficient, with only SAR ${parseFloat(project.budgetSpent).toLocaleString()} spent out of the total SAR ${parseFloat(project.budget).toLocaleString()} budget (${budgetPct}% burn rate). `;
    } else {
      summaryText += `The budget utilization has reached ${budgetPct}% (SAR ${parseFloat(project.budgetSpent).toLocaleString()} of SAR ${parseFloat(project.budget).toLocaleString()}), representing a compressed margin. `;
    }

    if (activeTasks.length > 0) {
      summaryText += `There are currently **${activeTasks.length} pending deliverables** under review. `;
    } else {
      summaryText += `All scheduled deliverables for the active phase have been signed off. `;
    }

    if (openRisks.length > 0) {
      const topRisk = openRisks[0];
      summaryText += `The primary technical risk identified is **"${topRisk.title}"** (Severity Score: ${topRisk.riskScore}/25). Mitigation protocols are active, led by the engineering division.`;
    } else {
      summaryText += `No critical active risk parameters are logged. Compliance and safety indicators remain healthy.`;
    }

    return summaryText;
  }

  /**
   * Translates a natural language question into database queries.
   */
  async processNaturalLanguageQuery(queryText) {
    const queryLower = queryText.toLowerCase();
    const { PipelineSegment, InspectionLog, Risk } = require('../models');

    // 1. Fetch data from DB to search against
    const projects = await Project.findAll({
      include: [{ model: Task, as: 'tasks' }, { model: Risk, as: 'risks' }]
    });

    const segments = await PipelineSegment.findAll({
      include: [
        { model: InspectionLog, as: 'inspections' },
        { model: Risk, as: 'risks' }
      ]
    });

    let matchedProjects = [];
    let matchedSegments = [];
    let answer = '';

    // 2. Pipeline Heuristic Router
    if (queryLower.includes('overdue inspection') || queryLower.includes('pipeline inspection')) {
      const today = new Date().toISOString().split('T')[0];
      matchedSegments = segments.filter(seg => 
        seg.inspections?.some(ins => ins.status === 'Overdue' || (ins.status === 'Scheduled' && ins.scheduledDate < today))
      );

      if (matchedSegments.length > 0) {
        answer = `I found **${matchedSegments.length} pipeline segments** with overdue inspections:\n\n` +
          matchedSegments.map(s => `- **${s.name}** (${s.region}): Last scheduled inspection is overdue. Current segment status is **${s.status}**.`).join('\n') +
          `\n\nI recommend assigning Priya Patel to clear these thickness profiling logs immediately.`;
      } else {
        answer = `All pipeline segment inspections are currently up to date. No overdue logs found.`;
      }
    }
    else if (queryLower.includes('critical segment') || queryLower.includes('pipeline status')) {
      matchedSegments = segments.filter(s => s.status === 'Critical' || s.status === 'ShutDown');

      if (matchedSegments.length > 0) {
        answer = `I identified **${matchedSegments.length} segments** requiring immediate technical response:\n\n` +
          matchedSegments.map(s => `- **${s.name}** (${s.region}): Status is **${s.status}**, Material: ${s.material}, Diameter: ${s.diameterInches}".`).join('\n') +
          `\n\nThese links are currently flagged for corrosion or pressure drop anomalies on the monitoring desk.`;
      } else {
        answer = `All segments are operating within safe pressure limits. No critical status flags are logged.`;
      }
    }
    else if (queryLower.includes('pipeline risk') || (queryLower.includes('risk') && queryLower.includes('pipeline'))) {
      const pipelineRisks = await Risk.findAll({
        where: { segmentId: { [require('sequelize').Op.ne]: null } },
        include: [{ model: PipelineSegment, as: 'segment', attributes: ['id', 'name'] }]
      });

      if (pipelineRisks.length > 0) {
        answer = `I found **${pipelineRisks.length} active risks** registered on pipeline infrastructure:\n\n` +
          pipelineRisks.map(r => `- **R${r.id}: ${r.title}** on **${r.segment?.name}** (Severity: **${r.riskScore}/25**, Status: **${r.status}**)`).join('\n') +
          `\n\nMitigation plans include sleeve reinforcement welding and anode bed updates.`;
      } else {
        answer = `No active risk parameters are logged for the pipeline network.`;
      }
    }
    // 3. Project / PMO Router
    else if (queryLower.includes('risk') || queryLower.includes('delayed') || queryLower.includes('behind schedule')) {
      matchedProjects = projects.filter(p => p.status === 'AtRisk' || p.status === 'Delayed');
      
      if (matchedProjects.length > 0) {
        answer = `I found **${matchedProjects.length} projects** currently flagged as At-Risk or Delayed: \n\n` +
          matchedProjects.map(p => `- **${p.name}** (${p.clientName}): Currently in **${p.currentPhase}** phase, status is **${p.status}** with a budget of SAR ${parseFloat(p.budget).toLocaleString()}.`).join('\n') +
          `\n\nI recommend reviewing the respective active Risk Logs and scheduling resource leveling.`;
      } else {
        answer = `All active PMO projects are currently **On Track**. No delays or at-risk flags are logged in the database.`;
      }
    } 
    else if (queryLower.includes('water') || queryLower.includes('desalination') || queryLower.includes('treatment')) {
      matchedProjects = projects.filter(p => p.serviceCategory === 'WaterTreatment' || p.serviceCategory === 'WastewaterTreatment');
      
      if (matchedProjects.length > 0) {
        answer = `I identified **${matchedProjects.length} active Water and Wastewater Treatment contracts**:\n\n` +
          matchedProjects.map(p => `- **${p.name}** for ${p.clientName} (Status: **${p.status}**, Phase: **${p.currentPhase}**)`).join('\n') +
          `\n\nThese facilities are currently tracked against their respective EPA and discharge compliance permits.`;
      } else {
        answer = `I couldn't locate any active Water Treatment contracts in the database directory.`;
      }
    }
    else if (queryLower.includes('budget') || queryLower.includes('expensive') || queryLower.includes('value')) {
      // Sort projects by budget descending
      const sorted = [...projects].sort((a, b) => b.budget - a.budget);
      const topProj = sorted[0];
      
      answer = `The project with the largest contract value is **${topProj.name}** for **${topProj.clientName}**, valued at **SAR ${parseFloat(topProj.budget).toLocaleString()}**. It is currently in the **${topProj.currentPhase}** phase and is **${topProj.status}** (SAR ${parseFloat(topProj.budgetSpent).toLocaleString()} spent).`;
      matchedProjects = [topProj];
    }
    else if (
      queryLower.includes('summarize') ||
      queryLower.includes('summary') ||
      queryLower.includes('executive') ||
      queryLower.includes('pmo status') ||
      queryLower.includes('overall pmo') ||
      queryLower.includes('active projects') ||
      queryLower.includes('report')
    ) {
      const activeCount = projects.length;
      const totalBudget = projects.reduce((acc, p) => acc + parseFloat(p.budget || 0), 0);
      const totalSpent = projects.reduce((acc, p) => acc + parseFloat(p.budgetSpent || 0), 0);
      const burnPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      const atRiskOrDelayed = projects.filter(p => p.status === 'AtRisk' || p.status === 'Delayed');
      const onTrackCount = projects.filter(p => p.status === 'OnTrack').length;
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      answer = `### 🛢️ PETROFLOW EXECUTIVE PMO STATUS REPORT
\n**Generated Date:** ${dateStr}
\n**Auditor:** AI PMO Intelligence Engine
\n
\n#### 1. Contract Portfolio Summary
\nWe currently track **${activeCount} active engineering & pipeline contracts** with a total budget size of **SAR ${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}**. The cumulative budget spent stands at **SAR ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}**, representing an overall burn rate of **${burnPct}%**.
\n- **On Track Contracts:** ${onTrackCount}
\n- **At-Risk / Delayed Contracts:** ${atRiskOrDelayed.length}
\n
\n#### 2. Risk & Delay Matrix
\n${atRiskOrDelayed.length > 0 
  ? `The following **${atRiskOrDelayed.length} contract(s)** are currently flagged for warning conditions:\n` + atRiskOrDelayed.map(p => `- **${p.name}** (${p.clientName}): Status is **${p.status}**, Phase: ${p.currentPhase}, Spent: SAR ${parseFloat(p.budgetSpent).toLocaleString()} of SAR ${parseFloat(p.budget).toLocaleString()}`).join('\n')
  : `All active contract parameters remain healthy with zero delay flags logged.`}
\n
\n#### 3. Recommended Leveling Actions
\n- Redirect specialist FTE capacity to support high-risk trunkline segments and valve coordination.
- Audit upcoming 30-day inspection schedules to maintain 100% compliance across active pipeline assets.`;
      matchedProjects = projects;
    }
    else {
      // Generic fallback search across project names
      matchedProjects = projects.filter(p => queryLower.split(' ').some(word => word.length > 3 && p.name.toLowerCase().includes(word)));
      
      if (matchedProjects.length > 0) {
        answer = `I matched **${matchedProjects.length} projects** relating to your query:\n\n` +
          matchedProjects.map(p => `- **${p.name}** (Status: **${p.status}**, Current Phase: **${p.currentPhase}**)`).join('\n');
      } else {
        answer = `I processed your request, but I couldn't find a direct database match for your query. Try asking:
        \n- *"Which projects are at risk?"*
        \n- *"Show me projects in Water Treatment"*
        \n- *"What is the most expensive project?"*
        \n- *"Show all segments with overdue inspections"*`;
      }
    }

    return {
      answer,
      structuredData: matchedProjects.length > 0 ? matchedProjects.map(p => ({
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        status: p.status,
        currentPhase: p.currentPhase,
        budget: p.budget,
        budgetSpent: p.budgetSpent
      })) : matchedSegments.map(s => ({
        id: s.id,
        name: s.name,
        clientName: s.region,
        status: s.status,
        currentPhase: s.segmentType,
        budget: s.diameterInches,
        budgetSpent: s.designPressure
      }))
    };
  }

  /**
   * Generates a proposal outline for a client and service category.
   */
  async generateProposalOutline(clientName, serviceCategory) {
    try {
      if (process.env.OPENAI_API_KEY) {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const prompt = `Write a professional engineering consulting proposal outline.
          Client: ${clientName}
          Service Category: ${serviceCategory}
          
          Include:
          1. Objective
          2. Scope of Work (tailored specifically to ${serviceCategory})
          3. Sprints / Methodology
          4. Recommended Timeline & Milestones`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        });
        return completion.choices[0].message.content.trim();
      }
    } catch (e) {
      console.warn('Real LLM API call failed, falling back to local heuristic proposal generator.', e.message);
    }

    // Heuristic Context-Aware Fallback
    const outline = `### TECHNICAL CONSULTING PROPOSAL OUTLINE

**Prepared For:** ${clientName}
**Service Domain:** ${serviceCategory} Execution Framework
**Date:** July 17, 2026

---

#### 1. Executive Objective
AeroPMO is pleased to submit this proposal outline to support **${clientName}** in executing deliverables under the **${serviceCategory}** domain. Our objective is to deliver world-class engineering designs, drawings, and digital twin models that meet all local municipality and Saudi Civil Defense regulatory frameworks.

#### 2. Detailed Scope of Work
Our structured engagement will encompass:
- **Phase 1: Diagnostic Assessment**: Analysis of site soil conditions, utilities layouts, or existing structural envelopes.
- **Phase 2: CAD Drafting & BIM Modeling**: Constructing high-fidelity Level-of-Detail (LOD) 400 Revit models, mechanical piping diagrams, and detailed structural designs.
- **Phase 3: Clash Detection & Regulatory Sync**: Resolving multi-discipline interferences and coordinating certifications with municipal authorities.

#### 3. Execution Timeline (12-Week Sprint)
- **Weeks 1–3**: Geotechnical review, baseline model structures setup, and data ingestion.
- **Weeks 4–8**: Mechanical electrical piping (MEP) layouts drafting and BIM clash detection reviews.
- **Weeks 9–12**: Regulatory submissions, handovers of as-built DWG/RVT files, and client sign-off.

---
*Note: Committing this draft will add it to the active Proposal Pipeline under the "Draft" column.*`;

    return outline;
  }
}

module.exports = new AIService();
