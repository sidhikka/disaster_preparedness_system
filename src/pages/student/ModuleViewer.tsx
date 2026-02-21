import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Tables } from "@/integrations/supabase/types";

type ModuleWithVideo = Tables<"modules"> & {
  video_url?: string | null;
};

export default function ModuleViewer() {
  const { moduleId } = useParams();

  const [module, setModule] = useState<ModuleWithVideo | null>(null);
  const [lessons, setLessons] = useState<Tables<"lessons">[]>([]);
  const [quizzes, setQuizzes] = useState<Tables<"quizzes">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId) return;

    const load = async () => {
      setLoading(true);

      const [m, l, q] = await Promise.all([
        supabase
          .from("modules")
          .select("*")
          .eq("id", moduleId)
          .single(),

        supabase
          .from("lessons")
          .select("*")
          .eq("module_id", moduleId)
          .order("order_index"),

        supabase
          .from("quizzes")
          .select("*")
          .eq("module_id", moduleId),
      ]);

      setModule(m.data as ModuleWithVideo);
      setLessons(l.data ?? []);
      setQuizzes(q.data ?? []);
      setLoading(false);
    };

    load();
  }, [moduleId]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto rounded-full" />
        </div>
      </StudentLayout>
    );
  }

  if (!module) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          Module not found.
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="w-full">

        {/* HEADER */}
        <div className="bg-muted/40 border-b py-12 px-6 md:px-16">
          <h1 className="text-4xl font-bold mb-4">
            {module.title}
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl">
            {module.description}
          </p>
        </div>

        {/* CONTENT */}
        <div className="px-6 md:px-20 py-16 space-y-16">

          {/* LESSON CONTENT */}
          <div className="prose prose-lg max-w-none">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            ))}
          </div>

          {/* 🎥 VIDEO SECTION */}
          {module.video_url && (
            <div className="space-y-6">
              <Separator />

              <div>
                <h2 className="text-3xl font-bold mb-6">
                  🎥 Lesson Video
                </h2>

                <div className="aspect-video">
                  <iframe
                    className="w-full h-full rounded-xl shadow-lg"
                    src={module.video_url}
                    title="Lesson Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* QUIZ SECTION */}
          {quizzes.length > 0 && (
            <div className="space-y-6">
              <Separator />

              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold">
                  📘 Test Your Knowledge
                </h2>

                <p className="text-muted-foreground text-lg">
                  Complete the quiz to evaluate your understanding.
                </p>

                {quizzes.map((quiz) => (
                  <Link key={quiz.id} to={`/student/quiz/${quiz.id}`}>
                    <Button size="lg" className="mt-4 px-10 py-6 text-lg">
                      Take Quiz
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </StudentLayout>
  );
}