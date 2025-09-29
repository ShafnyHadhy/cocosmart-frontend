// Labor Management Report Generation Service
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateCombinedReport = async (workers, tasks, analytics, dateRange) => {
  try {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = "/cocosmart logo.jpg"; // Use the same logo from your pages

    return new Promise((resolve, reject) => {
      logoImg.onload = () => {
        try {
          // Add logo
          doc.addImage(logoImg, "PNG", 15, 10, 30, 30);

          // Company Header
          doc.setFont("helvetica", "bold");
          doc.setFontSize(20);
          doc.text("CocoSmart Pvt Ltd", 105, 20, { align: "center" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(14);
          doc.text("Smart Solutions for Coconut Plantations", 105, 28, { align: "center" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Hotline: +94 77 123 4567 | Email: info@cocosmart.com  |  Fax: +1-234-567-890", 105, 36, { align: "center" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("123/C, Main Street, Colombo 01, Sri Lanka", 105, 42, { align: "center" });

          // Report Title
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text("Labor Management Report", 105, 53, { align: "center" });

          // Period and Generated On line
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(`Period: ${dateRange.start || "All"} - ${dateRange.end || "All"}`, 15, 64, { align: "left" });
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 193, 64, { align: "right" });

          // WORKFORCE SUMMARY SECTION
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text("Workforce Summary", 15, 80);

          // Workforce statistics
          const totalWorkers = workers.length;
          const availableWorkers = workers.filter(w => w.isAvailable).length;
          const busyWorkers = totalWorkers - availableWorkers;
          const utilizationRate = totalWorkers > 0 ? Math.round((busyWorkers / totalWorkers) * 100) : 0;

          // Prepare workforce data for table
          const workforceData = [];
          
          // Add worker details
          workers.forEach(worker => {
            const workerTasks = tasks.filter(task => task.assignedWorkers?.includes(worker.workerId));
            const completedTasks = workerTasks.filter(task => task.status === 'Completed').length;
            const completionRate = workerTasks.length > 0 ? Math.round((completedTasks / workerTasks.length) * 100) : 0;
            
            // Get worker name from the backend data
            const workerName = worker.name || worker.userEmail || 'N/A';
            
            workforceData.push([
              worker.workerId,
              workerName,
              worker.jobRole || 'N/A',
              worker.isAvailable ? 'Available' : 'Busy',
              workerTasks.length.toString(),
              completedTasks.toString(),
              `${completionRate}%`
            ]);
          });

          // Add workforce summary rows
          workforceData.push([
            "Total Workers",
            totalWorkers.toString(),
            "",
            "",
            "",
            "",
            "",
            "bold"
          ]);
          workforceData.push([
            "Available Workers",
            availableWorkers.toString(),
            "",
            "",
            "",
            "",
            "",
            "bold"
          ]);
          workforceData.push([
            "Utilization Rate",
            `${utilizationRate}%`,
            "",
            "",
            "",
            "",
            "",
            "bold"
          ]);

          // Generate workforce table
          autoTable(doc, {
            startY: 85,
            head: [["Worker ID", "Name", "Job Role", "Status", "Total Tasks", "Completed", "Completion Rate"]],
            body: workforceData.map((row) => row.slice(0, 7)), // Remove the "bold" column
            theme: "grid",
            styles: { fontSize: 9, lineWidth: 0.1, lineColor: [0, 0, 0] },
            headStyles: { 
              fillColor: [42, 85, 64], 
              textColor: 255, 
              halign: "center", 
              lineWidth: 0.0, 
              lineColor: [0, 0, 0] 
            },
            columnStyles: {
              0: { cellWidth: 25, halign: "left" },
              1: { cellWidth: 40, halign: "left" },
              2: { cellWidth: 25, halign: "left" },
              3: { cellWidth: 20, halign: "center" },
              4: { cellWidth: 20, halign: "center" },
              5: { cellWidth: 20, halign: "center" },
              6: { cellWidth: 30, halign: "center" }
            },
            didParseCell: function (data) {
              const row = workforceData[data.row.index];
              if (row && row[7] === "bold") {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.lineWidth = 0.1;
                data.cell.styles.lineColor = [0, 0, 0];
              }
            }
          });

          // TASKS SUMMARY SECTION
          const tasksStartY = doc.lastAutoTable.finalY + 20;
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text("Tasks Summary", 15, tasksStartY);

          // Task statistics
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(t => t.status === 'Completed').length;
          const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
          const todoTasks = tasks.filter(t => t.status === 'To Do').length;
          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          // Prepare tasks data for table
          const tasksData = [];
          
          // Add task details
          tasks.forEach(task => {
            tasksData.push([
              task.taskId,
              task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title,
              task.status,
              task.priority,
              task.category,
              (task.assignedWorkers?.length || 0).toString(),
              task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'Not scheduled'
            ]);
          });

          // Add tasks summary rows
          tasksData.push([
            "Total Tasks",
            totalTasks.toString(),
            "",
            "",
            "",
            "",
            "",
            "bold"
          ]);
          tasksData.push([
            "Completed Tasks",
            completedTasks.toString(),
            "",
            "",
            "",
            "",
            "",
            "bold"
          ]);
          tasksData.push([
            "Completion Rate",
            `${completionRate}%`,
            "",
            "",
            "",
            "",
            "",
            "bold"
          ]);

          // Generate tasks table
          autoTable(doc, {
            startY: tasksStartY + 10,
            head: [["Task ID", "Title", "Status", "Priority", "Category", "Assigned", "Scheduled"]],
            body: tasksData.map((row) => row.slice(0, 7)), // Remove the "bold" column
            theme: "grid",
            styles: { fontSize: 9, lineWidth: 0.1, lineColor: [0, 0, 0] },
            headStyles: { 
              fillColor: [42, 85, 64], 
              textColor: 255, 
              halign: "center", 
              lineWidth: 0.0, 
              lineColor: [0, 0, 0] 
            },
            columnStyles: {
              0: { cellWidth: 25, halign: "left" },
              1: { cellWidth: 45, halign: "left" },
              2: { cellWidth: 20, halign: "center" },
              3: { cellWidth: 20, halign: "center" },
              4: { cellWidth: 25, halign: "center" },
              5: { cellWidth: 20, halign: "center" },
              6: { cellWidth: 30, halign: "center" }
            },
            didParseCell: function (data) {
              const row = tasksData[data.row.index];
              if (row && row[7] === "bold") {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.lineWidth = 0.1;
                data.cell.styles.lineColor = [0, 0, 0];
              }
            }
          });

          // FOOTER
          const pageCount = doc.internal.getNumberOfPages();

          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            // Left footer: prepared/approved info
            doc.text("Prepared by: HR Manager | Approved by: Operations Manager", 15, 290, { align: "left" });
            // Right footer: report ID and page number
            doc.text(`Report ID: LAB-${Date.now()} | Page ${i} of ${pageCount}`, 200, 290, { align: "right" });
          }

          resolve(doc);
        } catch (error) {
          reject(error);
        }
      };

      logoImg.onerror = () => {
        // If logo fails to load, continue without it
        try {
          // Company Header without logo
          doc.setFont("helvetica", "bold");
          doc.setFontSize(20);
          doc.text("CocoSmart Pvt Ltd", 105, 20, { align: "center" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(14);
          doc.text("Smart Solutions for Coconut Plantations", 105, 28, { align: "center" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Hotline: +94 77 123 4567 | Email: info@cocosmart.com  |  Fax: +1-234-567-890", 105, 36, { align: "center" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("123/C, Main Street, Colombo 01, Sri Lanka", 105, 42, { align: "center" });

          // Report Title
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text("Labor Management Report", 105, 53, { align: "center" });

          // Period and Generated On line
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(`Period: ${dateRange.start || "All"} - ${dateRange.end || "All"}`, 15, 64, { align: "left" });
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 193, 64, { align: "right" });

          resolve(doc);
        } catch (error) {
          reject(error);
        }
      };
    });
  } catch (error) {
    console.error('Error generating combined report:', error);
    throw error;
  }
};

export const downloadPDF = (doc, filename) => {
  try {
    doc.save(filename);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};