import { useParams } from "react-router-dom";

function TeamWorkspacePage() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Team Workspace #{id}
      </h1>
    </div>
  );
}

export default TeamWorkspacePage;