import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { calculatePoints } from "@/utils/pointsCalculator";
import { Award } from "lucide-react";

interface SubmitWasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SubmitWasteDialog({
  open,
  onOpenChange,
  onSuccess,
}: SubmitWasteDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [openCodeBox, setOpenCodeBox] = useState(false);
  const [bins, setBins] = useState<any[]>([]);
  const [garbageCode, setGarbageCode] = useState("");
  const [estimatedPoints, setEstimatedPoints] = useState(0);
  const [formData, setFormData] = useState({
    wasteType: "",
    quantity: "",
    unit: "kg",
    binId: "",
    bagNumber: "",
    notes: "",
  });

  useEffect(() => {
    fetchBins();
  }, []);

  useEffect(() => {
    if (
      formData.wasteType &&
      formData.quantity &&
      parseFloat(formData.quantity) > 0
    ) {
      const points = calculatePoints(
        formData.wasteType as any,
        parseFloat(formData.quantity),
        formData.unit as "kg" | "units"
      );
      setEstimatedPoints(points);
    } else {
      setEstimatedPoints(0);
    }
  }, [formData.wasteType, formData.quantity, formData.unit]);

  const fetchBins = async () => {
    const { data, error } = await supabase.from("bins").select("*");
    if (!error && data) setBins(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .insert({
          user_id: user.id,
          waste_type: formData.wasteType as any,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          bin_id: formData.binId ? parseInt(formData.binId) : null,
          bag_number: formData.bagNumber,
          notes: formData.notes,
          points_earned: estimatedPoints,
          verification_status: "pending" as any,
        })
        .select("*");
      setGarbageCode(data[0].id.slice(0, 8));

      if (error) throw error;

      toast.success("E-waste submission recorded! Pending verification.");
      onSuccess();
      onOpenChange(false);
      setOpenCodeBox(true);

      // Reset form
      setFormData({
        wasteType: "",
        quantity: "",
        unit: "kg",
        binId: "",
        bagNumber: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit E-Waste</DialogTitle>
            <DialogDescription>
              Record your e-waste contribution and earn eco-points
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wasteType">E-Waste Type *</Label>
              <Select
                value={formData.wasteType}
                onValueChange={(value) =>
                  setFormData({ ...formData, wasteType: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="battery">Battery</SelectItem>
                  <SelectItem value="charger">Charger</SelectItem>
                  <SelectItem value="cable_wire">Cable/Wire</SelectItem>
                  <SelectItem value="mouse_keyboard">Mouse/Keyboard</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="cpu">CPU</SelectItem>
                  <SelectItem value="mobile">Mobile Phone</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g., 2.5"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="binId">Bin Location</Label>
              <Select
                value={formData.binId}
                onValueChange={(value) =>
                  setFormData({ ...formData, binId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bin (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {bins.map((bin) => (
                    <SelectItem key={bin.id} value={bin.id.toString()}>
                      {bin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bagNumber">Bag Number</Label>
              <Input
                id="bagNumber"
                placeholder="Optional"
                value={formData.bagNumber}
                onChange={(e) =>
                  setFormData({ ...formData, bagNumber: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            {estimatedPoints > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Estimated Points</p>
                  <p className="text-2xl font-bold text-primary">
                    {estimatedPoints}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-light"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit E-Waste"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={openCodeBox} onOpenChange={setOpenCodeBox}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>Your code is:</DialogHeader>
          <p className="text-3xl font-bold text-primary">{garbageCode}</p>
          <p className="text-muted-foreground">
            Please write this code on your garbage bag.
          </p>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary-light"
            onClick={() => setOpenCodeBox(false)}
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
