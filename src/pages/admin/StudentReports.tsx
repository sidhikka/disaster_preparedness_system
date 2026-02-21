import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import { toast } from "sonner";

interface StudentReport {
  user_id: string;
  full_name: string;
  quiz_count: number;
  avg_score: number;
}

export default function StudentReports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<StudentReport[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        // 1️⃣ Get all student user IDs
        const { data: studentRoles, error: roleError } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "student");

        if (roleError) throw roleError;

        if (!studentRoles || studentRoles.length === 0) {
          setReports([]);
          return;
        }

        const userIds = studentRoles.map((r) => r.user_id);

        // 2️⃣ Get profiles + quiz attempts
        const [profilesRes, attemptsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds),

          supabase
            .from("quiz_attempts")
            .select("user_id, score, total_questions")
            .in("user_id", userIds),
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (attemptsRes.error) throw attemptsRes.error;

        const profiles = profilesRes.data ?? [];
        const attempts = attemptsRes.data ?? [];

        // 3️⃣ Build report map
        const reportMap = new Map<string, StudentReport>();

        profiles.forEach((p) => {
          reportMap.set(p.user_id, {
            user_id: p.user_id,
            full_name: p.full_name ?? "Unnamed",
            quiz_count: 0,
            avg_score: 0,
          });
        });

        // 4️⃣ Calculate averages
        attempts.forEach((a) => {
          const r = reportMap.get(a.user_id);
          if (!r) return;

          const percentage =
            a.total_questions > 0
              ? (a.score / a.total_questions) * 100
              : 0;

          const totalScore = r.avg_score * r.quiz_count + percentage;
          r.quiz_count += 1;
          r.avg_score =
            r.quiz_count > 0 ? totalScore / r.quiz_count : 0;
        });

        setReports(Array.from(reportMap.values()));
      } catch (err: any) {
        console.error("Student report error:", err.message);
        toast.error("Failed to load student reports");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Student Reports</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No student data available yet.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Quizzes Taken</TableHead>
                    <TableHead>Avg Score</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.user_id}>
                      <TableCell className="font-medium">
                        {r.full_name}
                      </TableCell>
                      <TableCell>{r.quiz_count}</TableCell>
                      <TableCell>
                        {r.quiz_count > 0
                          ? r.avg_score.toFixed(1) + "%"
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
