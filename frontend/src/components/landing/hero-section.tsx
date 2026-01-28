import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 mb-4">
              Productivity Redefined
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Boost Your Productivity
            </h1>
            <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground">
              Manage your tasks efficiently with our intuitive todo app. Stay organized and accomplish more every day.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" className="px-8 py-3 text-base font-semibold">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-base font-semibold">
              Learn More
            </Button>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50">
              <CheckCircle className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Task Management</h3>
              <p className="text-sm text-muted-foreground">Organize and track your daily tasks</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50">
              <Zap className="h-8 w-8 text-purple-500 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Boost Productivity</h3>
              <p className="text-sm text-muted-foreground">Focus on what matters most</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50">
              <Shield className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">Your data is always safe</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };