import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, ExternalLink, X, ChevronDown, Trash2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { createTeam, updateTeam, deleteTeam } from "../../services/teamService";
import { getUsers } from "../../services/userService";
import { useTeams } from "../../hooks/useTeams";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import Avatar from "../../components/Avatar";
import { SkeletonCard } from "../../components/SkeletonLoader";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { validateTeamName, validateTeamMember } from "../../utils/validation";

type User = { id: number; username: string };

export default function TeamsPage() {
  const { teams, loading: teamsLoading, error, refreshTeams } = useTeams();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [removingMember, setRemovingMember] = useState<{teamId: number; userId: number} | null>(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{teamId: number; userId: number; username: string} | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (err) { console.error("Failed to load users:", err); }
      finally { setUsersLoading(false); }
    };
    loadUsers();
  }, []);

  const handleCreate = async () => {
    const nameError = validateTeamName(teamName);
    if (nameError) { setFormError(nameError); return; }
    setCreating(true);
    setFormError("");
    try {
      await createTeam({ name: teamName.trim() });
      setTeamName(""); setModalOpen(false);
      await refreshTeams();
      addToast("success", "Team created successfully");
    } catch {
      setFormError("Failed to create team.");
      addToast("error", "Failed to create team");
    }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteTeam(id);
      await refreshTeams();
      addToast("success", "Team deleted successfully");
    } catch (err) {
      addToast("error", "Failed to delete team");
      console.error(err);
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const handleAddMember = async (teamId: number, userId: number) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const dupError = validateTeamMember(userId, team.members);
    if (dupError) { addToast("error", dupError); return; }
    try {
      await updateTeam(teamId, { members: [...team.members, userId] });
      await refreshTeams();
      addToast("success", "Member added successfully");
    } catch (err) { addToast("error", "Failed to add member"); console.error(err); }
  };

  const handleRemoveMember = async (teamId: number, userId: number) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    if (team.owner === userId) {
      addToast("error", "Cannot remove the team owner. Transfer ownership first.");
      setConfirmRemoveMember(null);
      return;
    }
    setRemovingMember({ teamId, userId });
    try {
      await updateTeam(teamId, { members: team.members.filter((id) => id !== userId) });
      await refreshTeams();
      addToast("success", "Member removed successfully");
    } catch (err) { addToast("error", "Failed to remove member"); console.error(err); }
    finally { setRemovingMember(null); setConfirmRemoveMember(null); }
  };

  return (
    <DashboardLayout>
      <div className="page-enter space-y-6">
        <PageHeader
          title="Teams"
          subtitle={`${teams.length} team${teams.length !== 1 ? "s" : ""}`}
          action={
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
              New Team
            </Button>
          }
        />

        {error && (
          <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
            Failed to load teams: {error}
            <button onClick={refreshTeams} className="ml-3 underline hover:no-underline">Retry</button>
          </div>
        )}

        {teamsLoading || usersLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : teams.length === 0 ? (
          <EmptyState icon={<Users size={24} />} title="No teams yet"
            description="Create a team and add members to start collaborating"
            action={<Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setModalOpen(true)}>New Team</Button>}
          />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams.map((team) => {
              const owner = users.find((u) => u.id === team.owner);
              const nonMembers = users.filter((u) => !team.members.includes(u.id));
              return (
                <div key={team.id} className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 border border-violet-500/20">
                      <Users size={17} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{team.name}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Owner: {owner?.username ?? `#${team.owner}`}</p>
                    </div>
                  </div>

                  {/* Member avatars */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mb-2 uppercase tracking-wide">Members ({team.members.length})</p>
                    {team.members.length === 0 ? (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">No members yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {team.members.map((memberId) => {
                          const member = users.find((u) => u.id === memberId);
                          return (
                            <div key={memberId} className="group flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/50 rounded-full pl-1 pr-2 py-0.5">
                              <Avatar name={member?.username} size="xs" />
                              <span className="text-xs text-slate-700 dark:text-slate-300">{member?.username ?? `#${memberId}`}</span>
                              <button
                                onClick={() => setConfirmRemoveMember({ teamId: team.id, userId: memberId, username: member?.username ?? `#${memberId}` })}
                                disabled={(removingMember?.teamId === team.id && removingMember?.userId === memberId) || team.owner === memberId}
                                title={team.owner === memberId ? "Cannot remove the team owner" : "Remove member"}
                                className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5 disabled:opacity-50"
                              >
                                {removingMember?.teamId === team.id && removingMember?.userId === memberId ? (
                                  <span className="block h-2.5 w-2.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                                ) : <X size={10} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add member */}
                  {nonMembers.length > 0 && (
                    <div className="relative mb-3">
                      <select
                        onChange={(e) => { if (e.target.value) { handleAddMember(team.id, Number(e.target.value)); e.target.value = ""; } }}
                        className="w-full appearance-none rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 text-xs px-3 py-2 pr-7 outline-none hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer"
                      >
                        <option value="">+ Add member…</option>
                        {nonMembers.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                    <button                       onClick={() => navigate(`/teams/${team.id}`)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium transition-colors">
                      Open Workspace <ExternalLink size={11} />
                    </button>
                    <button
                      title="Delete team"
                      onClick={() => setConfirmDelete(team.id)}
                      disabled={deleting === team.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === team.id ? (
                        <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                      ) : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Delete Team"
        message="This will permanently delete this team and all its data. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting !== null}
      />

      <ConfirmDialog
        open={confirmRemoveMember !== null}
        onClose={() => setConfirmRemoveMember(null)}
        onConfirm={() => confirmRemoveMember && handleRemoveMember(confirmRemoveMember.teamId, confirmRemoveMember.userId)}
        title="Remove Member"
        message={`Are you sure you want to remove ${confirmRemoveMember?.username ?? "this member"} from the team?`}
        confirmLabel="Remove"
        loading={removingMember !== null}
      />

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setTeamName(""); setFormError(""); }} title="Create New Team">
        <div className="space-y-4">
          {formError && <div className="px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{formError}</div>}
          <Input label="Team Name" placeholder="e.g. Backend Engineers" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={creating} onClick={handleCreate} icon={<Plus size={14} />}>Create Team</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}