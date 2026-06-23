import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Crown, UserPlus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTeam } from "../../services/teamService";
import { getUsers } from "../../services/userService";
import { getTasks } from "../../services/taskService";
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from "../../services/teamMembershipService";
import { useAuth } from "../../context/AuthContext";
import { SkeletonTeamWorkspace } from "../../components/SkeletonLoader";
import ConfirmDialog from "../../components/ConfirmDialog";
import Button from "../../components/Button";
import { useToast } from "../../hooks/useToast";
import { useTeams } from "../../hooks/useTeams";
import { validateTeamMember } from "../../utils/validation";

type Team = {
  id: number;
  name: string;
  owner: number;
  members: number[];
  created_at: string;
};

type User = {
  id: number;
  username: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  team: number;
  team_name?: string;
};

type TeamMembership = {
  id: number;
  user: number;
  username: string;
  role: string;
};

function TeamWorkspacePage() {
  const { addToast } = useToast();
  const { refreshTeams } = useTeams();
  const { profile } = useAuth();
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("developer");
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<number | null>(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      setLoading(true);
      try {
        const [data, userData, taskData, membershipData] = await Promise.all([
          getTeam(Number(id)),
          getUsers(),
          getTasks(),
          getTeamMembers(Number(id)),
        ]);
        setTeam(data);
        setAllUsers(userData);
        setTasks(taskData);
        setMemberships(membershipData);
      } catch (error) {
        console.error(error);
        addToast("error", "Failed to load team data");
      } finally {
        setLoading(false);
      }
    };
    void loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = profile?.user_id === team?.owner;

  const teamTasks = team ? tasks.filter((t) => t.team === team.id) : [];
  const todoTasks = teamTasks.filter((t) => t.status === "todo");
  const inProgressTasks = teamTasks.filter((t) => t.status === "in_progress");
  const doneTasks = teamTasks.filter((t) => t.status === "done");

  const reloadMembers = async () => {
    const [data, membershipData] = await Promise.all([
      getTeam(Number(id)),
      getTeamMembers(Number(id)),
    ]);
    setTeam(data);
    setMemberships(membershipData);
  };

  const handleAddMember = async () => {
    if (!selectedUser || !team) return;
    const existingIds = memberships.map((m) => m.user);
    const dupError = validateTeamMember(Number(selectedUser), [...existingIds, team.owner]);
    if (dupError) { addToast("error", dupError); return; }
    try {
      await addTeamMember(Number(id), Number(selectedUser), selectedRole);
      await reloadMembers();
      setSelectedUser("");
      setSelectedRole("developer");
      await refreshTeams();
      addToast("success", "Member added successfully");
    } catch (error) {
      const axiosErr = error as { response?: { data?: Record<string, unknown> } };
      const data = axiosErr.response?.data;
      let msg = "Failed to add member";
      if (data) {
        const messages: string[] = [];
        for (const [, value] of Object.entries(data)) {
          if (Array.isArray(value)) messages.push(value.join(", "));
          else if (typeof value === "string") messages.push(value);
        }
        if (messages.length > 0) msg = messages.join("; ");
      }
      addToast("error", msg);
    }
  };

  const handleRoleChange = async (membershipId: number, role: string) => {
    try {
      await updateTeamMember(membershipId, role);
      await reloadMembers();
    } catch (error) {
      const axiosErr = error as { response?: { data?: Record<string, unknown> } };
      const data = axiosErr.response?.data;
      let msg = "Failed to update member role";
      if (data?.detail && typeof data.detail === "string") msg = data.detail;
      addToast("error", msg);
    }
  };

  const handleRemoveMember = async (membershipId: number) => {
    setRemovingMember(true);
    try {
      await deleteTeamMember(membershipId);
      await reloadMembers();
      await refreshTeams();
      addToast("success", "Member removed successfully");
    } catch (error) {
      const axiosErr = error as { response?: { data?: Record<string, unknown> } };
      const data = axiosErr.response?.data;
      let msg = "Failed to remove member";
      if (data?.detail && typeof data.detail === "string") msg = data.detail;
      addToast("error", msg);
    } finally {
      setRemovingMember(false);
      setConfirmRemoveMember(null);
    }
  };

  if (loading || !team) {
    return (
      <DashboardLayout>
        <SkeletonTeamWorkspace />
      </DashboardLayout>
    );
  }

  const nonMembers = allUsers.filter(
    (u) => !memberships.some((m) => m.user === u.id) && u.id !== team.owner
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {team.name}
        </h1>

        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Team ID: {team.id}
        </p>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Owner: {
            allUsers.find((user) => user.id === team.owner)?.username || `User #${team.owner}`
          }
        </p>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Members: {memberships.length}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm text-slate-500 dark:text-slate-400">Total Tasks</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{teamTasks.length}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm text-slate-500 dark:text-slate-400">Todo</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{todoTasks.length}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm text-slate-500 dark:text-slate-400">In Progress</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{inProgressTasks.length}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm text-slate-500 dark:text-slate-400">Done</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{doneTasks.length}</p>
          </div>
        </div>

        {/* Team Members */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Team Members
          </h2>

          <div className="mt-3 space-y-2">
            {memberships.map((membership) => {
              const memberIsOwner = team.owner === membership.user;
              return (
                <div
                  key={membership.id}
                  className="flex items-center justify-between rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span>{membership.username}</span>
                    {memberIsOwner && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                        <Crown size={11} />
                        Owner
                      </span>
                    )}
                  </div>

                  {/* Edit role + Remove — owner only, never for owner */}
                  {isOwner && !memberIsOwner && (
                    <div className="flex gap-2 items-center">
                      <Pencil size={13} className="text-slate-400" />
                      <select
                        value={membership.role}
                        onChange={(e) => handleRoleChange(membership.id, e.target.value)}
                        className="rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 text-sm"
                      >
                        <option value="lead">Lead</option>
                        <option value="developer">Developer</option>
                        <option value="tester">Tester</option>
                        <option value="designer">Designer</option>
                      </select>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={12} />}
                        onClick={() => setConfirmRemoveMember(membership.id)}
                        loading={removingMember && confirmRemoveMember === membership.id}
                        disabled={removingMember && confirmRemoveMember === membership.id}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add member — owner only */}
        {isOwner && (
          <div className="mt-4 flex gap-3 flex-wrap items-center">
            {nonMembers.length > 0 ? (
              <>
                <UserPlus size={16} className="text-slate-400" />
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="">Select User</option>
                  {nonMembers.map((user) => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="lead">Lead</option>
                  <option value="developer">Developer</option>
                  <option value="tester">Tester</option>
                  <option value="designer">Designer</option>
                </select>
                <Button variant="primary" size="md" onClick={handleAddMember} icon={<UserPlus size={14} />}>
                  Add Member
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No more users to add</p>
            )}
          </div>
        )}

        {/* Team Tasks */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Team Tasks
          </h2>
          <div className="mt-4 space-y-3">
            {teamTasks.map((task) => (
              <div key={task.id} className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{task.description}</p>
                <p className="mt-2 text-sm text-blue-400">Status: {task.status}</p>
                <p className="text-sm text-yellow-400">Priority: {task.priority}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRemoveMember !== null}
        onClose={() => setConfirmRemoveMember(null)}
        onConfirm={() => confirmRemoveMember && handleRemoveMember(confirmRemoveMember)}
        title="Remove Member"
        message="Are you sure you want to remove this member from the team?"
        confirmLabel="Remove"
        loading={removingMember}
      />
    </DashboardLayout>
  );
}

export default TeamWorkspacePage;
