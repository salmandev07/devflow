type InputProps = {
  type?: string;
  placeholder?: string;
};

function Input({
  type = "text",
  placeholder,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full p-3 rounded-lg bg-slate-800 text-white outline-none"
    />
  );
}

export default Input;