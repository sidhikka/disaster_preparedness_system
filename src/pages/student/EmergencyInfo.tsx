import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Phone } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function EmergencyInfo() {
  const [contacts, setContacts] = useState<Tables<"emergency_contacts">[]>([]);

  useEffect(() => {
    supabase.from("emergency_contacts").select("*").order("category").then(({ data }) => {
      setContacts(data ?? []);
    });
  }, []);

  const grouped = contacts.reduce((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {} as Record<string, Tables<"emergency_contacts">[]>);

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold">Emergency Contacts & Procedures</h2>
          <p className="text-muted-foreground">Important contacts to reach during emergencies.</p>
        </div>

        {contacts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            No emergency contacts available yet.
          </CardContent></Card>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-3">{category}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4">
                      <h4 className="font-medium">{c.name}</h4>
                      <p className="text-sm text-primary mt-1">📞 {c.phone}</p>
                      {c.email && <p className="text-sm text-muted-foreground">✉️ {c.email}</p>}
                      {c.address && <p className="text-sm text-muted-foreground">📍 {c.address}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </StudentLayout>
  );
}
