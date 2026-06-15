import AuthCard from "../../components/AuthCard";
import Button from "../../components/Button";
import Input from "../../components/Input";

function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <AuthCard>
        <h1 className="text-3xl font-bold text-white text-center">
          DevFlow
        </h1>

        <p className="text-slate-400 text-center mt-2">
          Sign in to continue
        </p>

        <form className="mt-8 space-y-4">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />

          <Button>
            Sign In
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}

export default LoginPage;