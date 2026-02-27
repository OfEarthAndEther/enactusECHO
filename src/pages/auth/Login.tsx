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
import { account } from "../../integrations/supabase/client.ts";
import { toast } from "sonner";
import { ID } from "appwrite";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleMagicLinkSubmit = async () => {
    try {
      if (
        !/^[A-Za-z]+(\.[A-Za-z]+)*\.ug\d{2}@nsut\.ac\.in$/.test(
          formData.email,
        ) &&
        formData.email != "jojot3750@gmail.com"
      ) {
        throw new Error("Enter valid NSUT email id");
      }
      setLoading(true);
      await account.createMagicURLToken(
        ID.unique(),
        formData.email,
        "https://enactus-echo.vercel.app/verify",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to send email");
    } finally {
      setLoading(false);
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
          <form className="space-y-4">
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
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-primary to-primary-light"
              disabled={loading}
              onClick={handleMagicLinkSubmit}
            >
              {loading ? "Sending..." : "Sign In"}
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
