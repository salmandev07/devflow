function Navbar() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
      <div>
        <h2 className="text-white text-xl font-semibold">
          Welcome Back 👋
        </h2>
      </div>

      <button
        onClick={handleLogout}
        className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-300 hover:scale-105"
      >
        Logout
      </button>
    </header>
  );
}

export default Navbar;