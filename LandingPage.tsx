import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, Users, Lock, Sparkles, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Clock,
    title: "Time-Locked Messages",
    description: "Write messages that unlock on a future date you choose. Your words, delivered when they matter most.",
  },
  {
    icon: Users,
    title: "Social Connections",
    description: "Connect with friends and send them future capsules. Surprise them on birthdays, graduations, or any special day.",
  },
  {
    icon: Lock,
    title: "Vault Security",
    description: "Messages stay sealed until the unlock date. No peeking, no editing — pure anticipation.",
  },
  {
    icon: Sparkles,
    title: "Dramatic Reveals",
    description: "When the time comes, your capsule opens with a cinematic vault animation and emotional intensity display.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-gradient-primary leading-tight">
              Digital Time Machine
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 font-body mb-8 max-w-2xl mx-auto">
              Messages that wait for the right moment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="font-display text-lg px-8 py-6 glow-primary">
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16"
          >
            <p className="text-muted-foreground text-sm font-body">
              Every second counts. Make yours unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold text-center mb-16 text-gradient-primary"
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:glow-primary transition-all duration-500 group"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:animate-pulse-glow" />
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm font-body">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass rounded-3xl p-12 glow-accent"
        >
          <h2 className="text-3xl font-display font-bold mb-4 text-foreground">
            Ready to Seal Your First Capsule?
          </h2>
          <p className="text-muted-foreground mb-8 font-body">
            Join thousands of time travelers already sending messages to the future.
          </p>
          <Link to="/auth">
            <Button size="lg" className="font-display text-lg px-8 py-6">
              Create Your Account <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30 text-center">
        <p className="text-muted-foreground text-sm font-body">
          © 2026 Digital Time Machine. The future is waiting.
        </p>
      </footer>
    </div>
  );
}
