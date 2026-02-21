import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export default function QuizQuestions() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState<Tables<"quiz_questions">[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_answer: 0,
  });

  const load = async () => {
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("order_index");

    setQuestions(data ?? []);
  };

  useEffect(() => {
    if (quizId) load();
  }, [quizId]);

  const handleCreate = async () => {
    if (!quizId) return;

    const { error } = await supabase.from("quiz_questions").insert({
      quiz_id: quizId,
      question: form.question,
      options: form.options,
      correct_answer: form.correct_answer,
      order_index: questions.length,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Question added");
    setOpen(false);
    setForm({
      question: "",
      options: ["", "", "", ""],
      correct_answer: 0,
    });

    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("quiz_questions").delete().eq("id", id);
    toast.success("Question deleted");
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Questions</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Question
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={form.question}
                    onChange={(e) =>
                      setForm({ ...form, question: e.target.value })
                    }
                  />
                </div>

                {form.options.map((opt, index) => (
                  <div key={index}>
                    <Label>Option {index + 1}</Label>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const updated = [...form.options];
                        updated[index] = e.target.value;
                        setForm({ ...form, options: updated });
                      }}
                    />
                  </div>
                ))}

                <div>
                  <Label>Correct Answer (0-3)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={form.correct_answer}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        correct_answer: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <Button onClick={handleCreate} className="w-full">
                  Save Question
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {questions.length === 0 ? (
          <p className="text-muted-foreground">
            No questions added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <Card key={q.id}>
                <CardContent className="p-4 flex justify-between">
                  <div>
                    <p className="font-semibold">
                      Q{i + 1}. {q.question}
                    </p>

                    {(q.options as string[]).map((opt, index) => (
                      <p
                        key={index}
                        className={`text-sm ${
                          index === q.correct_answer
                            ? "text-green-600 font-medium"
                            : ""
                        }`}
                      >
                        {index}. {opt}
                      </p>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
