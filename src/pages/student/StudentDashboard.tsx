import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ClipboardList, Calendar, Trophy, Phone } from "lucide-react";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    modules: 0,
    quizzes: 0,
    avgScore: 0,
  });

  const [upcomingDrills, setUpcomingDrills] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [modulesRes, attemptsRes, drillsRes, contactsRes] =
        await Promise.all([
          supabase.from("modules").select("id", { count: "exact", head: true }),

          supabase
            .from("quiz_attempts")
            .select("*, quizzes(title)")
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false })
            .limit(5),

          supabase
            .from("drills")
            .select("*")
            .gte("scheduled_date", new Date().toISOString())
            .order("scheduled_date")
            .limit(3),

          supabase.from("emergency_contacts").select("*"),
        ]);

      const attempts = (attemptsRes.data as any) ?? [];

      const totalScore = attempts.reduce(
        (sum: number, a: any) =>
          sum +
          (a.total_questions > 0
            ? (a.score / a.total_questions) * 100
            : 0),
        0
      );

      setStats({
        modules: modulesRes.count ?? 0,
        quizzes: attempts.length,
        avgScore:
          attempts.length > 0
            ? totalScore / attempts.length
            : 0,
      });

      setRecentAttempts(attempts);
      setUpcomingDrills(drillsRes.data ?? []);
      setContacts(contactsRes.data ?? []);
    };

    load();
  }, [user]);

  return (
    <StudentLayout>
      <div className="space-y-8">

        <h2 className="text-3xl font-bold">My Dashboard</h2>

        {/* STATS */}
        <div className="grid sm:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Available Modules
              </CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.modules}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Quizzes Taken
              </CardTitle>
              <ClipboardList className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.quizzes}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Average Score
              </CardTitle>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.avgScore.toFixed(0)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DRILLS + QUIZ RESULTS */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* UPCOMING DRILLS */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Drills</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDrills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming drills.
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingDrills.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 bg-muted rounded-lg space-y-1"
                    >
                      <p className="font-semibold">
                        {d.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(d.scheduled_date),
                          "PPP 'at' p"
                        )}
                      </p>
                      <p className="text-sm">
                        📍 {d.location}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* RECENT QUIZ RESULTS */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No quiz attempts yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentAttempts.map((a: any) => (
                    <div
                      key={a.id}
                      className="flex justify-between items-center p-4 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">
                          {a.quizzes?.title ?? "Quiz"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(a.completed_at),
                            "PPP"
                          )}
                        </p>
                      </div>
                      <span className="font-bold text-primary">
                        {a.score}/{a.total_questions}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* EMERGENCY CONTACTS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-600" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border rounded-lg space-y-1"
                >
                  <p className="font-semibold">
                    {c.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {c.department}
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      window.location.href = `tel:${c.phone}`
                    }
                  >
                    Call {c.phone}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </StudentLayout>
  );
}