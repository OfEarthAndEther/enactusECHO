import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
type UserRole = "normal" | "admin" | "superadmin";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [adminID, setAdminID] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    fetchRole();
  }, [user]);
  const fetchRole = async () => {
    // const { data, error } = await supabase
    //   .from("user_roles")
    //   .select("user_id, role")
    //   .eq("user_id", user.id)
    //   .single();
    try {
      if (user.labels[0] == "admin") {
        setRole(user.labels[0] as UserRole);
      }
    } catch (error) {
      setRole("normal");
    }
    setAdminID(user.$id);
    setLoading(false);
  };

  return {
    adminID,
    role,
    loading,
    isAdmin: role === "admin" || role === "superadmin",
    isSuperAdmin: role === "superadmin",
  };
}
