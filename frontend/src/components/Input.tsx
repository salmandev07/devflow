type InputProps = {
  type?: string;
  placeholder?: string;
  error?: string;
};

function Input({
  type = "text",
  placeholder,
  error,
}: InputProps) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg bg-slate-800 text-white outline-none border border-slate-700"
      />

      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;