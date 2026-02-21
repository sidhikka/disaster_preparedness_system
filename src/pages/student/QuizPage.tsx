import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { Tables } from "@/integrations/supabase/types";

const QUIZ_DURATION = 300; // 5 minutes

export default function QuizPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Tables<"quizzes"> | null>(null);
  const [questions, setQuestions] = useState<Tables<"quiz_questions">[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [passed, setPassed] = useState(false);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);

  // Load Quiz + Prevent Retake
  useEffect(() => {
    if (!quizId || !user) return;

    const load = async () => {
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", user.id);

      if (attempts && attempts.length > 0) {
        const best = Math.max(
          ...attempts.map(
            (a) => (a.score / a.total_questions) * 100
          )
        );
        if (best >= 70) {
          setAlreadyPassed(true);
          return;
        }
      }

      const [q, qs] = await Promise.all([
        supabase.from("quizzes").select("*").eq("id", quizId).single(),
        supabase.from("quiz_questions").select("*").eq("quiz_id", quizId),
      ]);

      setQuiz(q.data);
      setQuestions((qs.data ?? []).sort(() => Math.random() - 0.5));
    };

    load();
  }, [quizId, user]);

  // Timer
  useEffect(() => {
    if (submitted || alreadyPassed) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted, alreadyPassed]);

  const handleSubmit = async () => {
    if (!user || !quizId || submitted) return;

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    const percent = (correct / questions.length) * 100;
    const isPassed = percent >= 70;

    setScore(correct);
    setPercentage(percent);
    setPassed(isPassed);
    setSubmitted(true);

    await supabase.from("quiz_attempts").insert({
      quiz_id: quizId,
      user_id: user.id,
      score: correct,
      total_questions: questions.length,
      answers,
    });
  };

  const downloadCertificate = async () => {
    const element = document.getElementById("certificate");
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("certificate.pdf");
  };

  if (alreadyPassed) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-green-600">
            You have already passed this quiz 🎉
          </h2>
        </div>
      </StudentLayout>
    );
  }

  if (!quiz)
    return (
      <StudentLayout>
        <div className="py-20 text-center">Loading...</div>
      </StudentLayout>
    );

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto space-y-6">

        {!submitted && (
          <div className="text-right font-semibold text-primary">
            Time Left: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        )}

        {submitted && (
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-2xl font-bold">
                {score}/{questions.length}
              </p>
              <p className="text-lg">{percentage.toFixed(0)}%</p>
              <p className={passed ? "text-green-600" : "text-red-600"}>
                {passed ? "PASSED 🎉" : "FAILED ❌"}
              </p>

              {passed && (
                <>
                  <div
                    id="certificate"
                    className="mt-6 p-10 border-4 border-primary rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-center"
                  >
                    <h2 className="text-3xl font-bold text-primary">
                      Certificate of Achievement
                    </h2>
                    <p className="mt-4">This certifies that</p>
                    <h3 className="text-2xl font-semibold">
                      {user?.email}
                    </h3>
                    <p className="mt-4">
                      has successfully passed
                    </p>
                    <h4 className="text-xl font-bold mt-2">
                      {quiz.title}
                    </h4>
                    <p className="mt-4">
                      with score {percentage.toFixed(0)}%
                    </p>
                  </div>

                  <Button onClick={downloadCertificate}>
                    Download PDF Certificate 🎓
                  </Button>
                </>
              )}

              <Button variant="outline" onClick={() => navigate(-1)}>
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {!submitted &&
          questions.map((q, i) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle>
                  Q{i + 1}. {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(q.options as string[]).map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() =>
                      setAnswers({ ...answers, [q.id]: oi })
                    }
                    className={`w-full p-3 border rounded ${
                      answers[q.id] === oi
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}

        {!submitted && (
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={
              Object.keys(answers).length !== questions.length
            }
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </StudentLayout>
  );
}