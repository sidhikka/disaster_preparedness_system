import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, BookOpen, Calendar, Phone, Users, ClipboardList } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Disaster Modules", desc: "Comprehensive lessons on earthquakes, floods, fires, cyclones and more." },
  { icon: ClipboardList, title: "Quizzes & Assessment", desc: "Test knowledge with interactive quizzes and track scores over time." },
  { icon: Calendar, title: "Drill Scheduling", desc: "Plan and track emergency drills with calendar views and status tracking." },
  { icon: Phone, title: "Emergency Contacts", desc: "Centralized directory of local authorities, hospitals, and emergency services." },
  { icon: Users, title: "Student Progress", desc: "Monitor student engagement and performance with detailed analytics." },
  { icon: Shield, title: "Safety First", desc: "Built for schools and colleges to create a culture of disaster preparedness." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl">DisasterPrep</span>
          </div>
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Disaster Preparedness for <span className="text-primary">Schools & Colleges</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empower students and staff with knowledge and tools to prepare for, respond to, and recover from disasters. A complete education and management platform.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                <Shield className="h-4 w-4" /> Start Learning
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">Explore Features</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <f.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 DisasterPrep. Built for safer schools and colleges.
        </div>
      </footer>
    </div>
  );
}
