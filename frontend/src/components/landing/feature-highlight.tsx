import { FeatureCard } from "./feature-card";
import { motion } from "framer-motion";

const FeatureHighlight = () => {
  const features = [
    {
      title: "Smart Task Management",
      description: "Organize your tasks with priority levels and due dates.",
      icon: "📋"
    },
    {
      title: "Cloud Sync",
      description: "Access your tasks from any device, anywhere.",
      icon: "☁️"
    },
    {
      title: "Team Collaboration",
      description: "Share tasks and collaborate with your team seamlessly.",
      icon: "👥"
    },
    {
      title: "Security First",
      description: "Enterprise-grade security to protect your data.",
      icon: "🔒"
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Powerful Features
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to stay organized and productive.
            </p>
          </div>
        </motion.div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { FeatureHighlight };