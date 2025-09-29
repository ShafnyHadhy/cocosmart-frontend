import React, { useState, useEffect } from "react";
import { listWorkers, getWorkforceAnalytics } from "../../services/workerService";
import { listTasks } from "../../services/taskService";
import { 
  generateCombinedReport,
  downloadPDF 
} from "../../services/reportService";

export default function ReportsPage() {
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("combined_report");
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const cssVars = {
    "--green-calm": "#2a5540",
    "--medium-gray": "#e7e9e9",
    "--light-gray": "#f7f9f9",
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [workersResponse, tasksResponse, analyticsResponse] = await Promise.all([
        listWorkers().catch(err => {
          console.error("Error loading workers:", err);
          return { workers: [] };
        }),
        listTasks().catch(err => {
          console.error("Error loading tasks:", err);
          return { tasks: [] };
        }),
        getWorkforceAnalytics().catch(err => {
          console.error("Error loading analytics:", err);
          return null;
        })
      ]);
      setWorkers(workersResponse.workers || []);
      setTasks(tasksResponse.tasks || []);
      setAnalytics(analyticsResponse);
    } catch (error) {
      console.error("Error loading data:", error);
      // Set empty data to prevent crashes
      setWorkers([]);
      setTasks([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    
    try {
      let doc;
      let filename;
      
      // Filter tasks by date range if specified
      let filteredTasks = tasks;
      if (dateRange.startDate && dateRange.endDate) {
        filteredTasks = tasks.filter(task => {
          if (!task.scheduledDate) return false;
          const taskDate = new Date(task.scheduledDate);
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          return taskDate >= startDate && taskDate <= endDate;
        });
      }
      
      const dateRangeObj = {
        start: dateRange.startDate,
        end: dateRange.endDate
      };
      
      // Generate combined report
      doc = await generateCombinedReport(workers, filteredTasks, analytics, dateRangeObj);
      filename = `CocoSmart_Labor_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      downloadPDF(doc, filename);
      
      // Show success message
      alert(`Report generated successfully!\nType: ${reportTypes.find(t => t.value === reportType)?.label}\nDate Range: ${dateRange.startDate} to ${dateRange.endDate}\n\nPDF file has been downloaded.`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: "combined_report", label: "Labor Management Report", description: "Comprehensive workforce and tasks summary with professional formatting" }
  ];

  return (
    <div className="space-y-8" style={cssVars}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[var(--green-calm)]">
          Generate Reports
        </h2>
        <p className="text-gray-600">Create professional PDF reports for your labor management system</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Report Configuration</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Report Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Information</label>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-green-500 mt-1 mr-3">
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Labor Management Report</h4>
                  <p className="text-sm text-gray-600 mt-1">Comprehensive workforce and tasks summary with professional CocoSmart branding</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Quick Date Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      setDateRange({
                        startDate: weekAgo.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                      setDateRange({
                        startDate: monthAgo.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      });
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-[var(--green-calm)] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Report...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate PDF Report
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Report Preview</h3>
        
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Report Preview</h4>
            <p className="text-gray-600 mb-4">
              Select a report type and date range to see a preview of the data that will be included in your PDF report.
            </p>
            
            {/* Sample Report Data */}
            <div className="bg-white rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h5 className="font-semibold text-gray-800 mb-4">
                {reportTypes.find(t => t.value === reportType)?.label}
              </h5>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Report Period:</span>
                  <span className="font-medium">{dateRange.startDate} to {dateRange.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Workers:</span>
                  <span className="font-medium">{workers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tasks:</span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Tasks:</span>
                  <span className="font-medium">{tasks.filter(t => t.status === 'Completed').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Workers:</span>
                  <span className="font-medium">{workers.filter(w => w.isAvailable).length}</span>
                </div>
                {reportType === 'combined_report' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Combined Report includes:</strong><br/>
                      • Workforce summary with detailed worker table<br/>
                      • Tasks summary with complete task details<br/>
                      • Professional header and footer<br/>
                      • All data in one comprehensive PDF
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Templates Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Available Report Types</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-green-200">
            <h4 className="font-medium text-gray-900 mb-2 text-lg">📊 Labor Management Report</h4>
            <p className="text-sm text-gray-600 mb-4">Professional PDF report with CocoSmart branding including:</p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Company logo and branding</li>
              <li>• Workforce summary with detailed worker table</li>
              <li>• Tasks summary with complete task details</li>
              <li>• Professional header and footer</li>
              <li>• Formatted tables matching company standards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}