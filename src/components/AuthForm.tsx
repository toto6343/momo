import { supabase } from "fbase";
import { useState } from "react";
import toast from "react-hot-toast";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newAccount, setNewAccount] = useState(true);
  const [loading, setLoading] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = event;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (newAccount) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              displayName: email.split("@")[0],
            },
          },
        });
        if (error) throw error;
        toast.success("Account created!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccount = () => setNewAccount((prev) => !prev);

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col space-y-3">
        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="sr-only">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={onChange}
            className="px-4 py-3 bg-transparent border border-gray-700 rounded-md focus:outline-none focus:border-purple-500 transition-colors text-lg"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={onChange}
            className="px-4 py-3 bg-transparent border border-gray-700 rounded-md focus:outline-none focus:border-purple-500 transition-colors text-lg"
          />
        </div>
        <input
          type="submit"
          disabled={loading}
          value={loading ? "Processing..." : (newAccount ? "Create Account" : "Log In")}
          className="px-4 py-3 text-white font-bold bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-all disabled:opacity-50 mt-2"
        />
      </form>
      <div className="text-center pt-2">
        <button
          onClick={toggleAccount}
          type="button"
          className="text-purple-400 text-sm cursor-pointer hover:underline bg-transparent border-none"
        >
          {newAccount ? "Already have an account? Sign In" : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
};
export default AuthForm;
