type AuthCardProps = {
  children: React.ReactNode;
};

function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 shadow-xl">
      {children}
    </div>
  );
}

export default AuthCard;