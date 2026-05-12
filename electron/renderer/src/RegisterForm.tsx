interface RegisterFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onToggle: () => void;
}

export default function RegisterForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  onToggle,
}: RegisterFormProps) {
  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Logo */}
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Work<span className="text-indigo-500">Snap</span>
        </h1>

        <p className="text-slate-500 text-sm mt-2">
          Create your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-3">
        
        <input
          type="text"
          placeholder="Full Name"
          required
          className="
            w-full
            bg-slate-50
            border border-slate-200
            rounded-2xl
            px-4
            py-3
            text-slate-900
            placeholder:text-slate-400
            outline-none
            focus:ring-2
            focus:ring-indigo-500
            focus:border-indigo-500
            transition-all
          "
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email Address"
          required
          className="
            w-full
            bg-slate-50
            border border-slate-200
            rounded-2xl
            px-4
            py-3
            text-slate-900
            placeholder:text-slate-400
            outline-none
            focus:ring-2
            focus:ring-indigo-500
            focus:border-indigo-500
            transition-all
          "
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="
            w-full
            bg-slate-50
            border border-slate-200
            rounded-2xl
            px-4
            py-3
            text-slate-900
            placeholder:text-slate-400
            outline-none
            focus:ring-2
            focus:ring-indigo-500
            focus:border-indigo-500
            transition-all
          "
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            py-3
            mt-2
            bg-indigo-600
            hover:bg-indigo-500
            rounded-2xl
            text-white
            font-bold
            transition-all
            active:scale-95
            disabled:opacity-50
          "
        >
          {loading ? 'Creating...' : 'REGISTER'}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-slate-500 text-sm mt-5">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-indigo-400 font-semibold hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
}