interface RegisterFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onToggle: () => void;
}

export default function RegisterForm({ formData, setFormData, onSubmit, loading, onToggle }: RegisterFormProps) {
  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black">
          Work<span className="text-indigo-500">Snap</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2">Create your account</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email Address"
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'REGISTER'}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-6">
        Already have an account?{' '}
        <button onClick={onToggle} className="text-indigo-400 font-bold hover:underline">
          Login
        </button>
      </p>
    </div>
  )
}