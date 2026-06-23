import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FolderKanban, Search, ExternalLink, Trash2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getProjects, createProject, deleteProject } from "../../services/projectService";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { SkeletonCard } from "../../components/SkeletonLoader";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";
import { validateProjectName } from "../../utils/validation";

type Project = { id: number; name: string; description: string; owner: number };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    const load = async () => {
      try { setProjects(await getProjects()); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const loadProjects = async () => {
    try { setProjects(await getProjects()); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    const nameError = validateProjectName(name);
    if (nameError) { setFormError(nameError); return; }
    setCreating(true);
    setFormError("");
    try {
      await createProject({ name: name.trim(), description });
      setName(""); setDescription(""); setFormError("");
      setModalOpen(false);
      await loadProjects();
      addToast("success", "Project created successfully");
    } catch {
      setFormError("Failed to create project. Please try again.");
      addToast("error", "Failed to create project");
    }
    finally { setCreating(false); }
  };

  const closeModal = () => { setModalOpen(false); setFormError(""); setName(""); setDescription(""); };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      addToast("success", "Project deleted successfully");
    } catch (err) {
      addToast("error", "Failed to delete project");
      console.error(err);
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-enter space-y-6">
        <PageHeader
          title="Projects"
          subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          action={
            <Button variant="primary" size="md" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
              New Project
            </Button>
          }
        />

        {/* Search bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 pointer-events-none" />
          <input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 search-input"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={24} />}
            title={search ? "No matching projects" : "No projects yet"}
            description={search ? "Try a different search term" : "Create your first project to start tracking tasks"}
            action={!search ? (
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setModalOpen(true)}>
                New Project
              </Button>
            ) : undefined}
          />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <div key={project.id}
                className="group flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/20">
                    <FolderKanban size={17} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{project.name}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium transition-colors"
                  >
                    Open Project <ExternalLink size={11} />
                  </button>
                  {profile?.user_id === project.owner && (
                    <button
                      title="Delete project"
                      onClick={() => setConfirmDelete(project.id)}
                      disabled={deleting === project.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === project.id ? <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" /> : <Trash2 size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <Modal open={modalOpen} onClose={closeModal} title="Create New Project" size="md">
        <div className="space-y-4">
          {formError && (
            <div className="px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
              {formError}
            </div>
          )}
          <Input label="Project Name" placeholder="e.g. DevFlow Backend API" value={name}
            onChange={(e) => setName(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description <span className="text-slate-600 dark:text-slate-400 font-normal">(optional)</span></label>
            <textarea
              placeholder="Describe what this project is about…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm px-3 py-2.5 outline-none resize-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" loading={creating} onClick={handleCreate} icon={<Plus size={14} />}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Delete Project"
        message="This will permanently delete this project and all its associated tasks. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting !== null}
      />
    </DashboardLayout>
  );
}