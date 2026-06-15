import AuthCard from "../../components/AuthCard";
import Button from "../../components/Button";
import Input from "../../components/Input";

function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <AuthCard>
        <h1 className="text-3xl font-bold text-white text-center">
          Create Account
        </h1>

        <p className="text-slate-400 text-center mt-2">
          Join DevFlow today
        </p>

        <form className="mt-8 space-y-4">
          <Input placeholder="Full Name" />
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Input type="password" placeholder="Confirm Password" />

          <Button>
            Create Account
          </Button>
          <p className="text-center text-slate-400 mt-4">
            Already have an account?
            <a
                href="/"
                className="text-blue-500 ml-1"
            >
                Login
            </a>
          </p>
                    </form>
      </AuthCard>
    </div>
  );
}

export default RegisterPage;