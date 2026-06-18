import jsPDF from "jspdf";
import {
  useEffect,
  useState,
} from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getProjects } from "../../services/projectService";
import { getProjectReport,} from "../../services/reportService";


type Project = {
  id: number;
  name: string;
};

type Report = {
  project: string;

  total_tasks: number;

  completed: number;

  progress: number;

  todo: number;

  estimated_hours: number;

  actual_hours: number;
};

function ReportsPage() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [selectedProject,
    setSelectedProject] =
    useState("");

  const [report,
    setReport] =
    useState<Report | null>(
      null
    );

  useEffect(() => {
    const loadProjects =
      async () => {
        try {
          const data =
            await getProjects();

          setProjects(data);
        } catch (error) {
          console.error(error);
        }
      };

    void loadProjects();
  }, []);

  const loadReport =
    async () => {
      if (!selectedProject)
        return;

      try {
        const data =
          await getProjectReport(
            Number(
              selectedProject
            )
          );

        setReport(data);
      } catch (error) {
        console.error(error);
      }
    };

    const exportCSV = () => {
  if (!report) return;

  const rows = [
    ["Project", report.project],
    ["Tasks", report.total_tasks],
    ["Completed", report.completed],
    ["In Progress", report.progress],
    ["Todo", report.todo],
    ["Estimated Hours", report.estimated_hours],
    ["Actual Hours", report.actual_hours],
  ];

  const csvContent =
    rows
      .map((row) => row.join(","))
      .join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv",
    }
  );

  const url =
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `${report.project}-report.csv`;

  link.click();

  window.URL.revokeObjectURL(
    url
  );
};


const exportPDF = () => {
  if (!report) return;

  const pdf = new jsPDF();

  pdf.setFontSize(20);

  pdf.text(
    "DEVFLOW PROJECT REPORT",
    20,
    20
  );

  pdf.setFontSize(12);

  pdf.text(
    `Project: ${report.project}`,
    20,
    40
  );

  pdf.text(
    `Total Tasks: ${report.total_tasks}`,
    20,
    55
  );

  pdf.text(
    `Completed: ${report.completed}`,
    20,
    70
  );

  pdf.text(
    `In Progress: ${report.progress}`,
    20,
    85
  );

  pdf.text(
    `Todo: ${report.todo}`,
    20,
    100
  );

  pdf.text(
    `Estimated Hours: ${report.estimated_hours}`,
    20,
    115
  );

  pdf.text(
    `Actual Hours: ${report.actual_hours}`,
    20,
    130
  );

  pdf.save(
    `${report.project}-report.pdf`
  );
};
  return (
    <DashboardLayout>
      <h1
        className="
          text-3xl
          font-bold
          text-white
        "
      >
        Reports
      </h1>

      <div className="mt-6">
        <select
          value={
            selectedProject
          }
          onChange={(e) =>
            setSelectedProject(
              e.target.value
            )
          }
          className="
            rounded-xl
            bg-slate-800
            p-3
            text-white
          "
        >
          <option value="">
            Select Project
          </option>

          {projects.map(
            (project) => (
              <option
                key={
                  project.id
                }
                value={
                  project.id
                }
              >
                {project.name}
              </option>
            )
          )}
        </select>

        <button
          onClick={
            loadReport
          }
          className="
            ml-4
            rounded-xl
            bg-blue-600
            px-4
            py-3
            text-white
          "
        >
          Generate Report
        </button>
      </div>

      <button
        onClick={exportCSV}
        disabled={!report}
        className="
            ml-4
            rounded-xl
            bg-green-600
            px-4
            py-3
            text-white
        "
        >
        Export CSV
        </button>

        <button
            onClick={exportPDF}
            disabled={!report}
            className="
                ml-4
                rounded-xl
                bg-red-600
                px-4
                py-3
                text-white
            "
            >
            Export PDF
            </button>

      {report && (
        <div
          className="
            mt-8
            rounded-xl
            bg-slate-900
            p-6
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              text-white
            "
          >
            {report.project}
          </h2>

          <div
            className="
              mt-4
              space-y-2
            "
          >
            <p className="text-white">
              Tasks:
              {" "}
              {
                report.total_tasks
              }
            </p>

            <p className="text-green-400">
              Completed:
              {" "}
              {
                report.completed
              }
            </p>

            <p className="text-yellow-400">
              In Progress:
              {" "}
              {
                report.progress
              }
            </p>

            <p className="text-red-400">
              Todo:
              {" "}
              {report.todo}
            </p>

            <p className="text-cyan-400">
              Estimated:
              {" "}
              {
                report.estimated_hours
              }h
            </p>

            <p className="text-purple-400">
              Actual:
              {" "}
              {
                report.actual_hours
              }h
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ReportsPage;