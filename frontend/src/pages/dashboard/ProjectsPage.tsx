import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getProjects,
  createProject,
} from "../../services/projectService";

type Project = {
  id: number;
  name: string;
  description: string;
};

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };


  
  useEffect(() => {
  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchProjects();
}, []);



  const handleCreateProject = async () => {
    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      await createProject({
        name,
        description,
      });

      setName("");
      setDescription("");

      loadProjects();
    } catch (error) {
      console.error(error);
      alert("Failed to create project");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          Projects
        </h1>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl mt-8 shadow-xl">
        <input
          className="w-full p-3 rounded-xl bg-slate-800 text-white mb-3 outline-none border border-slate-700"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full p-3 rounded-xl bg-slate-800 text-white mb-3 outline-none border border-slate-700"
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <button
          onClick={handleCreateProject}
          className="
            bg-blue-600
            px-6
            py-3
            rounded-xl
            text-white
            hover:bg-blue-700
            hover:scale-105
            transition-all
          "
        >
          Create Project
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-6
              shadow-xl
              hover:scale-105
              hover:border-blue-500
              transition-all
              duration-300
            "
          >
            <h2 className="text-xl font-bold text-white">
              {project.name}
            </h2>

            <p className="text-slate-400 mt-3">
              {project.description}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                className="
                  px-4 py-2
                  bg-blue-600
                  hover:bg-blue-700
                  rounded-lg
                  text-white
                "
              >
                Open
              </button>

              <button
                className="
                  px-4 py-2
                  bg-red-600
                  hover:bg-red-700
                  rounded-lg
                  text-white
                "
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default ProjectsPage;