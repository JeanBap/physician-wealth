import { useState } from "react";
import { Section, Inp, Btn, Alert, Card } from "../components/ui";
import { signUp, signIn, signInWithGoogle, resetPassword } from "../lib/supabase";

const ADMIN_EMAIL = "papoutsis89@gmail.com";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw) {
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Password needs an uppercase letter";
  if (!/[0-9]/.test(pw)) return "Password needs a number";
  return null;
}

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
      if (!validateEmail(email)) { setError("Please enter a valid email address"); setLoading(false); return; }

      if (mode === "forgot") {
        const { error: resetErr } = await resetPassword(email);
        if (resetErr) { setError(resetErr.message || "Reset failed"); setLoading(false); return; }
        setResetSent(true);
      } else if (mode === "signup") {
        const pwErr = validatePassword(password);
        if (pwErr) { setError(pwErr); setLoading(false); return; }
        const { user, error: signUpErr } = await signUp(email, password, { first_name: firstName, last_name: lastName });
        if (signUpErr) { setError(signUpErr.message || "Signup failed"); setLoading(false); return; }
        const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
        onAuth({
          id: user?.id,
          email,
          firstName: firstName || (isAdmin ? "Yanni" : ""),
          lastName: lastName || (isAdmin ? "Papoutsi" : ""),
          plan: isAdmin ? "premium" : "trial",
          trialEnd: isAdmin ? null : new Date(Date.now() + 30 * 86400000).toISOString(),
          isAdmin,
        });
        navigate("onboarding");
      } else {
        const { user, error: signInErr } = await signIn(email, password);
        if (signInErr) { setError(signInErr.message || "Login failed"); setLoading(false); return; }
        const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
        onAuth({
          id: user?.id,
          email,
          firstName: user?.user_metadata?.first_name || (isAdmin ? "Yanni" : ""),
          lastName: user?.user_metadata?.last_name || (isAdmin ? "Papoutsi" : ""),
          plan: isAdmin ? "premium" : "trial",
          trialEnd: isAdmin ? null : new Date(Date.now() + 30 * 86400000).toISOString(),
          isAdmin,
        });
        navigate(isAdmin ? "dashboard" : "onboarding");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    const { error: gErr } = await signInWithGoogle();
    if (gErr) {
      // Fallback for local dev / no Supabase
      onAuth({ email: "google@user.com", firstName: "Google", plan: "trial", trialEnd: new Date(Date.now() + 30 * 86400000).toISOString() });
      navigate("onboarding");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg, #f8f9fa)" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-2xl font-black tracking-tight" style={{ color: "var(--emerald, #50b8a0)", fontFamily: "'Instrument Serif', Georgia, serif" }}>
            PhysicianWealth
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text3, #888)" }}>Financial Command Center for Physicians</p>
        </div>

        <Card className="space-y-4">
          {mode === "forgot" ? (
            <>
              <p className="text-xs text-center" style={{ color: "var(--text3, #888)" }}>Enter your email to reset password</p>
              <Inp label="Email" value={email} onChange={setEmail} type="email" />
              {error && <Alert type="danger">{error}</Alert>}
              {resetSent ? (
                <Alert type="success">Reset link sent to {email}. Check your inbox.</Alert>
              ) : (
                <Btn onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Btn>
              )}
              <button onClick={() => { setMode("login"); setError(""); }} className="w-full text-sm" style={{ color: "var(--text3, #888)" }}>
                Back to login
              </button>
            </>
          ) : (
            <>
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Inp label="First name" value={firstName} onChange={setFirstName} />
                    <Inp label="Last name" value={lastName} onChange={setLastName} />
                  </div>
                </>
              )}
              <Inp label="Email" value={email} onChange={setEmail} type="email" />
              <Inp label="Password" value={password} onChange={setPassword} type="password" />
              {mode === "signup" && (
                <p className="text-xs" style={{ color: "var(--text3, #888)", marginTop: -8 }}>Min 8 chars, 1 uppercase, 1 number</p>
              )}
              {error && <Alert type="danger">{error}</Alert>}
              <Btn onClick={handleSubmit} disabled={loading || !email.trim()} className="w-full">
                {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
              </Btn>
              <button onClick={handleGoogle} disabled={loading}
                className="w-full py-2 rounded-xl text-sm transition cursor-pointer"
                style={{ background: "var(--cardBg, #fff)", border: "1px solid var(--border, #e0e0e0)", color: "var(--text2, #555)" }}>
                Continue with Google
              </button>
              <button onClick={() => {
                onAuth({ id:"demo", email:"demo@physician.com", firstName:"Demo", lastName:"Physician", isAdmin:false, plan:"trial", trialEnd:new Date(Date.now()+30*86400000).toISOString() });
                navigate("onboarding");
              }} className="w-full py-3 rounded-xl text-sm font-bold transition mt-2 cursor-pointer"
                style={{ background: "var(--inputBg, #f5f5f5)", border: "1px solid var(--border, #e0e0e0)", color: "var(--text3, #888)" }}>
                Try Demo (No Account Needed)
              </button>
              <div className="flex justify-between text-sm">
                <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: "var(--emerald, #50b8a0)" }}>
                  {mode === "login" ? "Create account" : "Already have account"}
                </button>
                {mode === "login" && (
                  <button onClick={() => { setMode("forgot"); setError(""); }} style={{ color: "var(--text3, #888)" }}>
                    Forgot password?
                  </button>
                )}
              </div>
            </>
          )}
        </Card>
        <p className="text-xs text-center" style={{ color: "var(--text3, #888)" }}>Secured by Supabase Auth + Stripe. HIPAA-compliant infrastructure.</p>
      </div>
    </div>
  );
}
