import { motion } from "framer-motion";
import { X, Sparkles, Heart, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface CapsuleRevealProps {
  capsule: {
    title: string;
    message: string;
    emotional_intensity: number;
    created_at: string;
    unlock_date: string;
    sender_name?: string;
  };
  onClose: () => void;
}

export default function CapsuleReveal({ capsule, onClose }: CapsuleRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotateY: 90 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0.5, rotateY: -90, opacity: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="glass-strong rounded-3xl p-8 max-w-lg w-full glow-warm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Sparkles className="w-12 h-12 text-glow-warm mx-auto mb-4" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-2xl font-bold text-foreground"
          >
            {capsule.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground mt-2"
          >
            From {capsule.sender_name} · Written {format(new Date(capsule.created_at), "PPP")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <p className="text-foreground font-body leading-relaxed whitespace-pre-wrap">
            {capsule.message}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-glow-warm" />
            <span className="text-sm text-muted-foreground font-display">
              Intensity: {capsule.emotional_intensity}/10
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: capsule.emotional_intensity }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="w-2.5 h-2.5 rounded-full bg-glow-warm"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
