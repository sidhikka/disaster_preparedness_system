import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const drillTypes = [
  "Fire Drill",
  "Earthquake Drill",
  "Flood Drill",
  "Evacuation Drill",
  "Lockdown Drill",
  "Other",
];

export default function DrillManagement() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [drills, setDrills] = useState<Tables<"drills">[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    drill_type: "Fire Drill",
    description: "",
    scheduled_date: "",
    location: "",
  });

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("drills")
        .select("*")
        .order("scheduled_date", { ascending: false });

      if (error) throw error;

      setDrills(data ?? []);
    } catch (err: any) {
      console.error("Load drills error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.scheduled_date || !form.location) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("drills").insert({
        title: form.title,
        drill_type: form.drill_type,
        description: form.description,
        location: form.location,
        created_by: user?.id,
        status: "scheduled",
        scheduled_date: new Date(form.scheduled_date).toISOString(), // FIXED
      });

      if (error) throw error;

      toast.success("Drill scheduled successfully");

      setOpen(false);
      setForm({
        title: "",
        drill_type: "Fire Drill",
        description: "",
        scheduled_date: "",
        location: "",
      });

      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const markComplete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("drills")
        .update({ status: "completed" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Drill marked as completed");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Drill Management</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Schedule Drill
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Drill</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.drill_type}
                    onValueChange={(v) =>
                      setForm({ ...form, drill_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {drillTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduled_date}
                    onChange={(e) =>
                      setForm({ ...form, scheduled_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <Button onClick={handleCreate} className="w-full">
                  Schedule Drill
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : drills.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No drills scheduled yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {drills.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{d.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {d.drill_type} · {d.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(d.scheduled_date), "PPP 'at' p")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        d.status === "completed" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {d.status}
                    </Badge>

                    {d.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markComplete(d.id)}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3 w-3" /> Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
