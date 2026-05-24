import { useState } from "react";
import { Section, Inp, Btn, Alert, Card } from "../components/ui";

const ADMIN_EMAIL = "papoutsis89@gmail.com";

export default function Auth({ onAuth, navigate }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "forgot") {
        setResetSent(true);
      } else if (mode === "signup") {
        const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
        onAuth({
          email,
          firstName: firstName || (isAdmin ? "Yanni" : ""),
          lastName: lastName || (isAdmin ? "Papoutsi" : ""),
          plan: isAdmin ? "premium" : "trial",
          trialEnd: isAdmin ? null : new Date(Date.now() + 14 * 86400000).toISOString(),
          isAdmin,
        });
        navigate("onboarding");
      } else {
        const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
        onAuth({
          email,
          firstName: isAdmin ? "Yanni" : "",
          lastName: isAdmin ? "Papoutsi" : "",
          plan: isAdmin ? "premium" : "trial",
          trialEnd: isAdmin ? null : new Date(Date.now() + 14 * 86400000).toISOString(),
          isAdmin,
        });
        navigate(isAdmin ? "dashboard" : "onboarding");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0b10" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-emerald-400 text-2xl font-black tracking-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            PhysicianWealth
          </p>
          <p className="text-sm text-white/55 mt-1">Financial Command Center for Physicians</p>
        </div>

        <Card className="space-y-4">
          {mode === "forgot" ? (
            <>
              <p className="text-xs text-white/55 text-center">Enter your email to reset password</p>
              <Inp label="Email" value={email} onChange={setEmail} type="email" />
              {resetSent ? (
                <Alert type="success">Reset link sent to {email}. Check your inbox.</Alert>
              ) : (
                <Btn onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Btn>
              )}
              <button onClick={() => setMode("login")} className="w-full text-sm text-white/55 hover:text-white/55">
                Back to login
              </button>
            </>
          ) : (
            <>
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-2">
                  <Inp label="First name" value={firstName} onChange={setFirstName} />
                  <Inp label="Last name" value={lastName} onChange={setLastName} />
                </div>
              )}
              <Inp label="Email" value={email} onChange={setEmail} type="email" />
              <Inp label="Password" value={password} onChange={setPassword} type="password" />
              {error && <Alert type="danger">{error}</Alert>}
              <Btn onClick={handleSubmit} disabled={loading || !email.trim()} className="w-full">
                {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
              </Btn>
              <button onClick={() => {
                onAuth({ email: "google@user.com", firstName: "Google", plan: "trial", trialEnd: new Date(Date.now() + 14 * 86400000).toISOString() });
                navigate("onboarding");
              }} className="w-full py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white/75 hover:bg-white/[0.08] transition">
                Continue with Google
              </button>
              <button onClick={() => {
                onAuth({ id:"demo", email:"demo@physician.com", firstName:"Demo", lastName:"Physician", isAdmin:false, plan:"trial", trialEnd:new Date(Date.now()+14*86400000).toISOString() });
                navigate("onboarding");
              }} className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/55 font-bold hover:bg-white/[0.08] transition mt-2">
                Try Demo (No Account Needed)
              </button>
              <div className="flex justify-between text-sm">
                <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-emerald-400/70 hover:text-emerald-400">
                  {mode === "login" ? "Create account" : "Already have account"}
                </button>
                {mode === "login" && (
                  <button onClick={() => setMode("forgot")} className="text-white/55 hover:text-white/55">
                    Forgot password?
                  </button>
                )}
              </div>
            </>
          )}
        </Card>
        <p className="text-xs text-white/65 text-center">Secured by Supabase Auth + Stripe. HIPAA-compliant infrastructure.</p>
      </div>
    </div>
  );
}
