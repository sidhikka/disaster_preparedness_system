import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { supabase } from "@/integrations/supabase/client";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("user_id, score, total_questions")
        .order("score", { ascending: false })
        .limit(10);

      setLeaders(data ?? []);
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">🏆 Leaderboard</h2>
        {leaders.map((l, i) => (
          <div key={i} className="p-3 border rounded mb-2 flex justify-between">
            <span>Rank {i + 1}</span>
            <span>
              {Math.round((l.score / l.total_questions) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}