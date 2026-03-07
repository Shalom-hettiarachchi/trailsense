"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Navigation from "@/components/Navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // global + field errors
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  const emailIsValid = useMemo(() => {
    // simple email check (good enough for UI)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const validate = () => {
    setError("");
    setEmailError("");
    setPasswordError("");
    setNameError("");

    let ok = true;

    if (!email.trim()) {
      setEmailError("Email is required.");
      ok = false;
    } else if (!emailIsValid) {
      setEmailError("Enter a valid email address.");
      ok = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      ok = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      ok = false;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setNameError("Full name is required.");
        ok = false;
      } else if (fullName.trim().length < 2) {
        setNameError("Full name must be at least 2 characters.");
        ok = false;
      }
    }

    return ok;
  };

  const mapServerErrorToFields = (message: string) => {
    const msg = (message || "").toLowerCase();

    // tweak these keywords to match your backend messages
    if (
      msg.includes("password") ||
      msg.includes("incorrect") ||
      msg.includes("invalid credentials") ||
      msg.includes("credentials")
    ) {
      setPasswordError(message);
      return;
    }

    if (msg.includes("user not found") || msg.includes("no user")) {
      setEmailError(message);
      return;
    }

    if (msg.includes("email")) {
      setEmailError(message);
      return;
    }

    // fallback global error
    setError(message);
  };

  // ============================
  // SUBMIT
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    setEmailError("");
    setPasswordError("");
    setNameError("");

    try {
      const url = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const body = isLogin ? { email, password } : { email, password, fullName };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || data?.error || "Authentication failed";
        throw new Error(msg);
      }

      // ✅ ROLE-BASED REDIRECT
      if (isLogin) {
        const role = data?.user?.role;

        if (role === "admin" || role === "guide") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } else {
        // after signup → normal users go to overview
        router.push("/");
      }

      router.refresh();
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      mapServerErrorToFields(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmailError("");
    setPasswordError("");
    setNameError("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center bg-gradient-soft px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}
              {!isLogin && (
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shalom Hettiarachchi"
                    required
                  />
                  {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                </div>
              )}

              {/* EMAIL */}
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              </div>

              {/* PASSWORD */}
              <div className="space-y-1">
                <Label>Password</Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {passwordError ? (
                  <p className="text-xs text-red-500">{passwordError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
                )}
              </div>

              {/* GLOBAL ERROR */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* BUTTON */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            {/* SWITCH */}
            <div className="mt-4 text-center text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}

              <button
                type="button"
                className="ml-1 text-primary underline"
                onClick={switchMode}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}