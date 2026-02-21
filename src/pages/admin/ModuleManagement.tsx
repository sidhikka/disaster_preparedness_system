import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, BookOpen } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const disasterTypes = ["Earthquake", "Flood", "Fire", "Cyclone", "Tsunami", "Landslide", "Drought", "Other"];
const difficultyLevels = ["beginner", "intermediate", "advanced"];

export default function ModuleManagement() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Tables<"modules">[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", disaster_type: "Earthquake", difficulty_level: "beginner" });

  const load = async () => {
    const { data } = await supabase.from("modules").select("*").order("created_at", { ascending: false });
    setModules(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from("modules").insert({ ...form, created_by: user?.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Module created!" });
    setOpen(false);
    setForm({ title: "", description: "", disaster_type: "Earthquake", difficulty_level: "beginner" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("modules").delete().eq("id", id);
    toast({ title: "Module deleted" });
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Module Management</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Module</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Module</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Disaster Type</Label>
                  <Select value={form.disaster_type} onValueChange={(v) => setForm({ ...form, disaster_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {disasterTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty_level} onValueChange={(v) => setForm({ ...form, difficulty_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((l) => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full">Create Module</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {modules.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            No modules yet. Create your first module to get started.
          </CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{m.title}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{m.description}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">{m.disaster_type}</span>
                    <span className="bg-muted px-2 py-1 rounded capitalize">{m.difficulty_level}</span>
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
