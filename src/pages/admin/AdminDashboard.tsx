import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ClipboardList, Calendar, Users, Phone } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    modules: 0,
    quizzes: 0,
    drills: 0,
    students: 0,
    contacts: 0,
  });

  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    passRate: 0,
  });

  useEffect(() => {
    const load = async () => {
      // 📊 Basic Stats
      const [m, q, d, s, c, attemptsRes] = await Promise.all([
        supabase.from("modules").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }),
        supabase.from("drills").select("id", { count: "exact", head: true }),
        supabase
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "student"),
        supabase
          .from("emergency_contacts")
          .select("id", { count: "exact", head: true }),
        supabase.from("quiz_attempts").select("*"),
      ]);

      setStats({
        modules: m.count ?? 0,
        quizzes: q.count ?? 0,
        drills: d.count ?? 0,
        students: s.count ?? 0,
        contacts: c.count ?? 0,
      });

      // 📈 Analytics
      const attempts = attemptsRes.data ?? [];

      const passed = attempts.filter(
        (a) => (a.score / a.total_questions) * 100 >= 70
      );

      setAnalytics({
        totalAttempts: attempts.length,
        passRate: attempts.length
          ? Math.round((passed.length / attempts.length) * 100)
          : 0,
      });
    };

    load();
  }, []);

  const cards = [
    { label: "Modules", value: stats.modules, icon: BookOpen },
    { label: "Quizzes", value: stats.quizzes, icon: ClipboardList },
    { label: "Drills", value: stats.drills, icon: Calendar },
    { label: "Students", value: stats.students, icon: Users },
    { label: "Emergency Contacts", value: stats.contacts, icon: Phone },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>

        {/* Basic Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 📊 Analytics Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Quiz Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics.totalAttempts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Pass Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {analytics.passRate}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}