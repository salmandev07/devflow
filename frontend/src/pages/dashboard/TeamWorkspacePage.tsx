import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTeam } from "../../services/teamService";
import { getUsers } from "../../services/userService";
import { getTasks } from "../../services/taskService";
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember, } from "../../services/teamMembershipService";
import { SkeletonTeamWorkspace } from "../../components/SkeletonLoader";
import ConfirmDialog from "../../components/ConfirmDialog";
import Button from "../../components/Button";
import { useToast } from "../../hooks/useToast";
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
        } finally {
          setLoading(false);
        }
      };
      
    void loadTeam();
  }, [id]);


  const teamTasks = team
    ? tasks.filter(
        (task) => task.team === team.id
      )
    : [];

  const todoTasks = teamTasks.filter(
    (task) => task.status === "todo"
  );

  const inProgressTasks =
    teamTasks.filter(
      (task) =>
        task.status === "in_progress"
    );

  const doneTasks = teamTasks.filter(
    (task) => task.status === "done"
  );

  const handleAddMember = async () => {
    if (!selectedUser) return;

    const existingIds = memberships.map((m) => m.user);
    const dupError = validateTeamMember(Number(selectedUser), existingIds);
    if (dupError) { addToast("error", dupError); return; }

    try {
      await addTeamMember(Number(id), Number(selectedUser), selectedRole);
      const updatedMembers = await getTeamMembers(Number(id));
      setMemberships(updatedMembers);
      setSelectedUser("");
      setSelectedRole("developer");
      addToast("success", "Member added successfully");
    } catch (error) {
      addToast("error", "Failed to add member");
      console.error(error);
    }
  };
 
  const reloadMembers = async () => {
  const data = await getTeamMembers(
    Number(id)
  );

  setMemberships(data);
};

const handleRoleChange = async (
  membershipId: number,
  role: string
) => {
  try {
    await updateTeamMember(
      membershipId,
      role
    );

    await reloadMembers();
  } catch (error) {
    console.error(error);
  }
};

const handleRemoveMember = async (membershipId: number) => {
  const membership = memberships.find((m) => m.id === membershipId);
  if (membership && team && membership.user === team.owner) {
    addToast("error", "Cannot remove the team owner. Transfer ownership first.");
    setConfirmRemoveMember(null);
    return;
  }
  setRemovingMember(true);
  try {
    await deleteTeamMember(membershipId);
    await reloadMembers();
    addToast("success", "Member removed successfully");
  } catch (error) {
    addToast("error", "Failed to remove member");
    console.error(error);
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
            allUsers.find(
              (user) => user.id === team.owner
            )?.username || `User #${team.owner}`
          }
        </p>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Members: {team.members.length}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm text-slate-500 dark:text-slate-400">
              Total Tasks
            </h3>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {teamTasks.length}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm text-slate-500 dark:text-slate-400">
              Todo
            </h3>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {todoTasks.length}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm text-slate-500 dark:text-slate-400">
              In Progress
            </h3>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {inProgressTasks.length}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm text-slate-500 dark:text-slate-400">
              Done
            </h3>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {doneTasks.length}
            </p>
          </div>
        </div>


       
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Team Members
            </h2>

            <div className="mt-3 space-y-2">
              {memberships.map((membership) => (
                  <div
                    key={membership.id}
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        bg-white dark:bg-slate-800
                        border border-slate-200 dark:border-slate-700
                        p-3
                        text-slate-900 dark:text-white
                      "
                  >
                    <span>
                      {membership.username}
                    </span>

                    <div className="flex gap-2">

                      <select
                        value={membership.role}
                        onChange={(e) =>
                          handleRoleChange(
                            membership.id,
                            e.target.value
                          )
                        }
                        className="
                          rounded-lg
                          bg-white dark:bg-slate-700
                          border border-slate-200 dark:border-slate-600
                          px-2
                          py-1
                          text-sm
                        "
                      >
                        <option value="lead">
                          Lead
                        </option>

                        <option value="developer">
                          Developer
                        </option>

                        <option value="tester">
                          Tester
                        </option>

                        <option value="designer">
                          Designer
                        </option>
                      </select>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmRemoveMember(membership.id)}
                        loading={removingMember && confirmRemoveMember === membership.id}
                        disabled={removingMember && confirmRemoveMember === membership.id}
                      >
                        Remove
                      </Button>

                    </div>
                  </div>
                ))}
            </div>
          </div>


          <div className="mt-4 flex gap-3 flex-wrap">

            <select
              value={selectedUser}
              onChange={(e) =>
                setSelectedUser(
                  e.target.value
                )
              }
              className="
                rounded-lg
                bg-white dark:bg-slate-700
                border border-slate-200 dark:border-slate-600
                px-3
                py-2
                text-sm
                text-slate-900 dark:text-white
              "
            >
              <option value="">
                {allUsers.length === 0
                  ? "No users available"
                  : "Select User"}
              </option>

              {(() => {
                const existingIds = memberships.map((m) => m.user);
                return allUsers
                  .filter((u) => !existingIds.includes(u.id))
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ));
              })()}
            </select>

            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(
                  e.target.value
                )
              }
              className="
                rounded-lg
                bg-white dark:bg-slate-700
                border border-slate-200 dark:border-slate-600
                px-3
                py-2
                text-sm
                text-slate-900 dark:text-white
              "
            >
              <option value="lead">
                Lead
              </option>

              <option value="developer">
                Developer
              </option>

              <option value="tester">
                Tester
              </option>

              <option value="designer">
                Designer
              </option>
            </select>

            <Button variant="primary" size="md" onClick={handleAddMember}>
              Add Member
            </Button>

          </div>
                  


        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Team Tasks
          </h2>

          <div className="mt-4 space-y-3">
            {tasks
              .filter(
                (task) =>
                  task.team === team.id
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {task.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400">
                    {task.description}
                  </p>

                  <p className="mt-2 text-sm text-blue-400">
                    Status: {task.status}
                  </p>

                  <p className="text-sm text-yellow-400">
                    Priority: {task.priority}
                  </p>
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
