import React from 'react';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onToggle: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email, setEmail, password, setPassword,
  showPassword, setShowPassword, loading, onSubmit, onToggle
}) => {
  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white italic tracking-tighter">
           Work<span className="text-indigo-500">Snap</span> 🚀
        </h2>
        <p className="text-slate-400 text-sm mt-2 font-medium">Welcome back, please login</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          required
          disabled={loading}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            disabled={loading}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-[10px] text-indigo-400 font-bold hover:text-indigo-300 uppercase tracking-widest"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'LOG IN'}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-6">
        New here?{' '}
        <button onClick={onToggle} className="text-indigo-400 font-bold hover:underline">
          Create Account
        </button>
      </p>
    </div>
  );
};

export default LoginForm;