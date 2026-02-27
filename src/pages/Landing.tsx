import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Leaf,
  Recycle,
  Award,
  Users,
  ArrowRight,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { account, tablesDB } from "@/integrations/supabase/client";
import { Query } from "appwrite";

export default function Landing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    handleUserName();
  }, [user]);
  const handleUserName = async () => {
    if (user) {
      try {
        setLoading(true);
        const data = await tablesDB.getRow({
          databaseId: "68b425c600306430be1c",
          tableId: "profiles",
          rowId: user.$id,
        });
        if (user.name == "") {
          await account.updateName(data.full_name);
        }
      } catch (error) {
        if (error.name == 401) {
          throw error;
        } else {
          toast.error(error.message || "Failed to update name");
        }
      } finally {
        setLoading(false);
      }
    }
  };
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 pt-16 pb-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                A Sustainable Initiative by Enactus NSUT
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-l from-[#004643] via-primary-light to-accent bg-clip-text">
              Project ECHO
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Electronic Collection & Handling Organization - Transform your
              e-waste into eco-points. Join the sustainable revolution at NSUT.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth/signup")}
                className="bg-gradient-to-r from-[#087671] to-primary-light text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/locations")}
              >
                View Bin Locations
                <MapPin className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/40">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                6
              </div>
              <div className="text-sm text-muted-foreground">
                Collection Bins
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                500+
              </div>
              <div className="text-sm text-muted-foreground">
                Students Engaged
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                100kg+
              </div>
              <div className="text-sm text-muted-foreground">
                E-waste Collected
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                5+
              </div>
              <div className="text-sm text-muted-foreground">
                Partner Organizations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to contribute to a sustainable campus
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-primary to-primary-light p-3 rounded-lg w-fit mb-4">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Deposit E-Waste</h3>
                <p className="text-muted-foreground">
                  Drop your electronic waste at any of our 6 strategically
                  placed bins across campus.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-primary to-primary-light p-3 rounded-lg w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Points</h3>
                <p className="text-muted-foreground">
                  Log your submission and earn eco-points based on the type and
                  quantity of e-waste.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-primary to-primary-light p-3 rounded-lg w-fit mb-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Redeem Rewards</h3>
                <p className="text-muted-foreground">
                  Exchange your points for exclusive coupons and rewards from
                  our partner brands.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join the Movement
              </h2>
              <p className="text-lg text-muted-foreground">
                Together, we can make NSUT a model for sustainable e-waste
                management
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">For Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn rewards while contributing to environmental
                    sustainability. Track your impact and compete with peers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">For Campus</h3>
                  <p className="text-sm text-muted-foreground">
                    Creating awareness about proper e-waste disposal and
                    building a culture of environmental responsibility.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth/signup")}
                className="bg-gradient-to-r from-primary to-primary-light"
              >
                Start Contributing Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
