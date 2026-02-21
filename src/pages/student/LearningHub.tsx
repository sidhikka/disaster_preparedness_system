import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function LearningHub() {
  const [modules, setModules] = useState<Tables<"modules">[]>([]);

  useEffect(() => {
    supabase
      .from("modules")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setModules(data ?? []);
      });
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Learning Hub
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore structured disaster preparedness courses.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {modules.map((module) => (
            <Card
              key={module.id}
              className="group p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border"
            >

              {/* Title */}
              <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition">
                {module.title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-5 line-clamp-3">
                {module.description}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="secondary">
                  {module.disaster_type}
                </Badge>
                <Badge variant="outline">
                  {module.difficulty_level}
                </Badge>
              </div>

              {/* Action */}
              <Link
                to={`/student/modules/${module.id}`}
                className="flex items-center justify-between text-primary font-medium group-hover:underline"
              >
                Start Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>

            </Card>
          ))}

        </div>
      </div>
    </StudentLayout>
  );
}