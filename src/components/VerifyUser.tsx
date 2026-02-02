import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, tablesDB } from "../integrations/supabase/client.ts";
import { Models, Query } from "appwrite";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button.tsx";

export default function Verify() {
  const [user, setUser] = useState<Models.User | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const secret = searchParams.get("secret");
  const userId = searchParams.get("userId");

  useEffect(() => {
    init();
  }, [user]);
  const init = async () => {
    try {
      const newSession = await account.createSession({
        userId,
        secret,
      });
      const getUser = await account.get();
      setUser(getUser);
      setLoading(false);
    } catch (err) {
      toast.error(err.message || "An error occured");
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  return user ? (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="flex flex-col justify-center w-full max-w-md shadow-lg p-2">
        <CardHeader>Welcome back {user.name}</CardHeader>
        <CardContent>Please refresh after clicking the button</CardContent>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          Welcome
        </Button>
      </Card>
    </div>
  ) : (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>User not found</CardHeader>
      </Card>
    </div>
  );
}
