import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for email verification redirect
  const searchParams = new URLSearchParams(window.location.search);
  const hasError = searchParams.get('error');
  const isUnverified = searchParams.get('unverified') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Email verification check disabled for development
        // To enable: uncomment check below and configure Supabase email
        // if (!data.user?.email_confirmed_at) {
        //   toast({ 
        //     title: "Email not verified", 
        //     description: "Please check your email and click the verification link before signing in.",
        //     variant: "destructive"
        //   });
        //   return;
        // }
        
        toast({ title: "Welcome back!" });
        navigate("/dashboard");
      } else {
        if (password.length < 6) {
          toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || undefined },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email!",
          description: "We sent you a verification link. Please verify your email and then sign in.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    try {
      // Detect iframe for preview environments
      const isIframe = window.self !== window.top;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          skipBrowserRedirect: isIframe,
          redirectTo: "/dashboard",
        },
      });
      
      if (error) throw error;

      if (isIframe && data?.url) {
        const popup = window.open(data.url, "oauth", "width=500,height=600");
        if (!popup) {
          toast({
            title: "Popup blocked",
            description: "Please allow popups or open this app in a new tab to use social login.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-card">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={32} className="text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-4">ConsistTrack</h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Track your progress, build habits, and achieve your goals with beautiful visualizations.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 size={18} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ConsistTrack</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin ? "Enter your credentials to continue" : "Start tracking your consistency today"}
          </p>
          
          {isUnverified && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6 text-sm">
              <p className="text-amber-600 font-medium">Email not verified</p>
              <p className="text-amber-600/80 text-xs mt-1">Please check your email for the verification link and verify your account before accessing the dashboard.</p>
            </div>
          )}

          {/* Social login */}
          <Button variant="outline" className="w-full h-11 mb-4" onClick={() => handleSocialLogin("google")}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <div className="relative mt-1.5">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11 bg-secondary border-border" />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11 bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative mt-1.5">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11 bg-secondary border-border" />
              </div>
            </div>
            <Button variant="hero" className="w-full h-11" type="submit" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

          <Link to="/" className="block text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
