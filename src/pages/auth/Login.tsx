import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        !/^[A-Za-z]+(\.[A-Za-z]+)*\.ug\d{2}@nsut\.ac\.in$/.test(formData.email)
      ) {
        throw new Error("Enter valid NSUT email id");
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };
  const handleMagicLinkSubmit = async () => {
    try {
      if (
        !/^[A-Za-z]+(\.[A-Za-z]+)*\.ug\d{2}@nsut\.ac\.in$/.test(formData.email)
      ) {
        throw new Error("Enter valid NSUT email id");
      }
      setLoadingEmail(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: "",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to send email");
    } finally {
      setLoadingEmail(false);
      toast.success("Please check your email");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-gradient-to-br from-primary to-primary-light p-3 rounded-lg w-fit">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Project ECHO account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@nsut.ac.in"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-light"
              disabled={loadingEmail || loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-primary to-primary-light"
              disabled={loadingEmail || loading}
              onClick={handleMagicLinkSubmit}
            >
              {loadingEmail ? "Sending..." : "Use Email Only"}
            </Button>
          </form>

          {/* <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <Link
              to="/auth/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
