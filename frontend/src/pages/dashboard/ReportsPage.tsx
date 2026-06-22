import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { ChevronDown, Download, FileText, BarChart3, CheckCircle2, Clock, ListTodo, Timer } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getProjects } from "../../services/projectService";
import { getProjectReport } from "../../services/reportService";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import { SkeletonReportResult } from "../../components/SkeletonLoader";

type Project = { id: number; name: string };
type Report = {
  project: string; total_tasks: number; completed: number;
  progress: number; todo: number; estimated_hours: number; actual_hours: number;
};

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{value}</p>
    </div>
  );
}

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try { setProjects(await getProjects()); }
      catch (err) { console.error(err); }
    };
    void load();
  }, []);

  const loadReport = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try { setReport(await getProjectReport(Number(selectedProject))); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const completionPct = report && report.total_tasks > 0
    ? Math.round((report.completed / report.total_tasks) * 100) : 0;

  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ["Project", report.project], ["Tasks", report.total_tasks],
      ["Completed", report.completed], ["In Progress", report.progress],
      ["Todo", report.todo], ["Estimated Hours", report.estimated_hours],
      ["Actual Hours", report.actual_hours],
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.project}-report.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!report) return;
    const pdf = new jsPDF();
    pdf.setFontSize(20); pdf.text("DEVFLOW PROJECT REPORT", 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Project: ${report.project}`, 20, 40);
    pdf.text(`Total Tasks: ${report.total_tasks}`, 20, 55);
    pdf.text(`Completed: ${report.completed}`, 20, 70);
    pdf.text(`In Progress: ${report.progress}`, 20, 85);
    pdf.text(`Todo: ${report.todo}`, 20, 100);
    pdf.text(`Estimated Hours: ${report.estimated_hours}`, 20, 115);
    pdf.text(`Actual Hours: ${report.actual_hours}`, 20, 130);
    pdf.save(`${report.project}-report.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="page-enter space-y-6">
        <PageHeader title="Reports" subtitle="Generate analytics for any project" />

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm px-3 py-2.5 pr-8 outline-none hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 transition-colors cursor-pointer">
              <option value="">Select a project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 pointer-events-none" />
          </div>
          <Button variant="primary" size="md" loading={loading} onClick={loadReport}
            icon={<BarChart3 size={14} />} disabled={!selectedProject}>
            Generate
          </Button>
          <div className="hidden sm:block h-6 w-px bg-slate-100 dark:bg-slate-800" />
          <Button variant="secondary" size="md" onClick={exportCSV} disabled={!report}
            icon={<Download size={14} />}>CSV</Button>
          <Button variant="secondary" size="md" onClick={exportPDF} disabled={!report}
            icon={<Download size={14} />}>PDF</Button>
        </div>

        {/* Report */}
        {loading ? (
          <SkeletonReportResult />
        ) : !report ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-500 mb-4">
              <FileText size={28} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">No report generated</p>
            <p className="text-xs text-slate-600">Select a project and click Generate</p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{report.project}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{report.total_tasks} tasks tracked</p>
                </div>
                <span className="text-2xl font-bold text-indigo-400 tabular-nums">{completionPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">Task completion rate</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard label="Total Tasks" value={report.total_tasks} icon={BarChart3} color="bg-indigo-600" />
              <MetricCard label="Completed" value={report.completed} icon={CheckCircle2} color="bg-emerald-600" />
              <MetricCard label="In Progress" value={report.progress} icon={Clock} color="bg-amber-600" />
              <MetricCard label="To Do" value={report.todo} icon={ListTodo} color="bg-slate-300 dark:bg-slate-600" />
              <MetricCard label="Est. Hours" value={`${report.estimated_hours}h`} icon={Timer} color="bg-blue-600" />
              <MetricCard label="Actual Hours" value={`${report.actual_hours}h`} icon={Timer} color="bg-violet-600" />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}