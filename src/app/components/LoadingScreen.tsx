import { motion } from "motion/react";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed inset-0 z-50 bg-white dark:bg-neutral-950 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        RM
      </motion.div>
    </motion.div>
  );
}
