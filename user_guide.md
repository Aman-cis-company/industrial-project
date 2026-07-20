# 🛢️ PetroFlow | User & Operations Guide

Welcome to the **PetroFlow** Oil & Gas Pipeline Monitoring & ERP platform. This guide is designed to help first-time users navigate the platform, monitor live pipeline telemetry, manage project construction, assign field crew, and automate compliance workflows.

---

## 🚀 1. Quick Start: Accessing the Platform

To access the platform, log in using the demo accounts pre-configured on the sign-in screen:
1. **Navigate**: Open the system in your browser at `http://localhost:5173`.
2. **Select Account**: Choose one of the pre-loaded operational roles (e.g., **Sarah Jenkins** as *Admin*, **Marcus Vance** as *PMO Director*, **Elena Rostova** as *Project Manager*, or **Carlos Mendez** as *Engineer*).
3. **Log In**: Click the account badge for quick sign-in or enter the credentials:
   * **Username**: `admin@industrial-project.com`
   * **Password**: `password123`

---

## 📂 2. How to Manage Pipeline Projects & Construction

Pipeline PMO allows you to track construction contracts and expansions (e.g. *Hazira-Vijaipur-Jagdishpur Trunk Expansion*):
1. Go to **Pipeline PMO & Projects** in the sidebar.
2. If you are an **Admin** or **PMO Director**, click the **"Register Project"** button at the top right.
3. Fill out the pipeline details:
   * **Project Name**: (e.g., *Abqaiq Critical Loop Overhaul*)
   * **Client**: Select the energy company (e.g., *ONGC*, *GAIL*, or *Indian Oil*).
   * **Service Category**: Select the division (e.g., *Pipeline Transmission* or *Cathodic Protection*).
   * **Budget**: Set the contract value in SAR/INR.
   * **Timeline**: Choose the start and target completion dates.
   * **Project Manager**: Assign a Senior PM to lead the crew.
4. Click **"Submit"** to save to the database.

---

## 📋 3. How to Create and Track Safety Tasks

Tasks are managed in a Kanban board inside each project workspace:
1. Go to **Pipeline PMO & Projects** in the sidebar, and click on any active pipeline project.
2. Click the **Tasks** tab inside the project page.
3. Click the **"Add Task"** button.
4. Enter the task parameters:
   * **Title & Description**: Describe the inspection or physical work (e.g., *Ultrasonic wall thickness test calibration*).
   * **Phase**: Assign the task to a phase gate (*Design*, *Approval*, or *Execution*).
   * **Priority**: Choose *Low*, *Medium*, or *High*.
   * **Assignee**: Assign to any crew specialist allocated to the project.
   * **Due Date**: Select the target completion date.
5. Click **"Save Task"**. The task will appear on the project's Kanban board, where you can drag and drop it between *To Do*, *In Progress*, and *Completed* columns.

---

## 👥 4. How to Manage Crew & Specialist Allocations

Ensure your engineering crew is not overloaded before sending them to the field:
1. **Allocate Team Members**:
   * Open a project from the **Pipeline PMO & Projects** list.
   * Go to the **Team** tab and click **"Assign Team Member"**.
   * Choose a specialist, enter their **Role on Project** (e.g., *Lead Piping Liaison*), and set their **Allocation %** (e.g., *50%* workload).
2. **Check Workforce Overload**:
   * Go to the **Specialist Heatmap** under the *Workforce & Field Crew* sidebar group.
   * Verify if a specialist is overallocated (>100% capacity) to avoid project delays.
3. **Crew Directory**:
   * Go to **Field Staff Directory** to check real-time availability. Every team member's avatar has a color-coded status dot:
     * 🟢 **Pulsing Green**: Online & Available.
     * 🟡 **Amber**: Busy.
     * ⚪ **Gray**: Offline or On Leave.

---

## 📝 5. How to Manage P&ID Drawings & DMS Documents

Store, version, and review technical pipeline alignment sheets, drawings, and permits:
1. Go to **Pipeline DMS Drawings** in the sidebar (or open the **Documents** tab inside any specific project page).
2. Click **"Upload Document"** or drag-and-drop your drawing file directly into the upload area.
3. Select the file details:
   * **Discipline**: (e.g., *BIM, Piping, Civil, General*).
   * **Description**: Detail the version edits (e.g., *Approved P&ID for Abqaiq Valve Station 3*).
4. Click **"Upload"** to save.

---

## 📊 6. How to Monitor Live Pipelines (IoT Telemetry & Map)

Monitor IoT sensor data, inspect segments, and resolve leak incidents in real-time:
1. **Interactive Telemetry Map**:
   * Go to **Interactive Telemetry Map** in the sidebar.
   * Double-click any marker or segment path to see live telemetry (flow rate, operating pressure, temperature) and trigger override actions if a valve leaks.
2. **Segments Grid**:
   * Go to **Segments Grid** to see a list of all pipelines and their health status (*Operational*, *Critical*, *Under Maintenance*).
3. **Incident Control Desk**:
   * Go to **Incident Control Desk** to see sensor alarms.
   * If a pressure drop or unauthorized excavation is reported, click **"Report Incident"** to log the issue and dispatch a repair crew.

---

## 🤖 7. How to Use the Pipeline AI Copilot

Use AI to query project databases, compile reports, and draft proposals:
1. Go to **Pipeline AI Copilot** in the sidebar.
2. Use suggested prompt chips or type your own question:
   * *"Which projects are at risk?"*
   * *"Show all segments with overdue inspections."*
   * *"Draft a proposal for GAIL under Gas Transmission."*
3. The AI will output data directly from your database and generate files/text for you.

---

## ⚙️ 8. Personal Settings & Profile

Manage your avatar, email, and password:
1. Go to **Settings** under the *Admin* sidebar group.
2. Update your details (email, phone, avatar link) and click **"Save Profile Details"**.
3. To update your password, enter a new one in the password form and click **"Update Password"**.
