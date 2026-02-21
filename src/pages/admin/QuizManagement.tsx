import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function QuizManagement() {
  const [loading, setLoading] = useState(true);

  const [quizzes, setQuizzes] = useState<
    (Tables<"quizzes"> & {
      modules: { title: string } | null;
    })[]
  >([]);

  const [modules, setModules] = useState<Tables<"modules">[]>([]);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    module_id: "",
  });

  const load = async () => {
    try {
      const [q, m] = await Promise.all([
        supabase
          .from("quizzes")
          .select("*, modules(title)")
          .order("created_at", { ascending: false }),

        supabase.from("modules").select("*"),
      ]);

      if (q.error) throw q.error;
      if (m.error) throw m.error;

      setQuizzes((q.data as any) ?? []);
      setModules(m.data ?? []);
    } catch (err: any) {
      console.error("Quiz load error:", err.message);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      module_id: "",
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.title) {
      toast.error("Quiz title is required");
      return;
    }

    if (!form.module_id) {
      toast.error("Please select a module");
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("quizzes")
          .update(form)
          .eq("id", editingId);

        if (error) throw error;

        toast.success("Quiz updated");
      } else {
        const { error } = await supabase
          .from("quizzes")
          .insert(form);

        if (error) throw error;

        toast.success("Quiz created");
      }

      setOpen(false);
      resetForm();
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Quiz deleted");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (
    quiz: Tables<"quizzes"> & { modules: { title: string } | null }
  ) => {
    setForm({
      title: quiz.title,
      description: quiz.description ?? "",
      module_id: quiz.module_id,
    });

    setEditingId(quiz.id);
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quiz Management</h2>

          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Quiz
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Quiz" : "Create Quiz"}
                </DialogTitle>
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
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Module</Label>
                  <Select
                    value={form.module_id}
                    onValueChange={(v) =>
                      setForm({ ...form, module_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>

                    <SelectContent>
                      {modules.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update Quiz" : "Create Quiz"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No quizzes yet. Create your first quiz.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((q) => (
              <Card key={q.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle
                      className="text-base cursor-pointer"
                      onClick={() => handleEdit(q)}
                    >
                      {q.title}
                    </CardTitle>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(q.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {q.description}
                  </p>

                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {q.modules?.title ?? "Unknown module"}
                  </span>

                  <Link to={`/admin/quizzes/${q.id}`}>
                    <Button size="sm" className="w-full mt-2">
                      Manage Questions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
