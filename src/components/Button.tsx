type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
};

function Button({ children, type = "button" }: ButtonProps) {
  return (
    <button
      type={type}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
    >
      {children}
    </button>
  );
}

export default Button;