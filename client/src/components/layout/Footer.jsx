import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      className="relative z-10 mt-16 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <div className="container mx-auto px-4">
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by MockMind AI Team • 2026</span>
          </div>

          {/* Tech Stack */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="glass-effect px-3 py-1 rounded-full">React</span>
            <span className="glass-effect px-3 py-1 rounded-full">Vite</span>
            <span className="glass-effect px-3 py-1 rounded-full">Tailwind</span>
            <span className="glass-effect px-3 py-1 rounded-full">Ollama</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {[
              { icon: Github, href: '#' },
              { icon: Twitter, href: '#' },
              { icon: Linkedin, href: '#' },
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                className="glass-effect p-2 rounded-full hover:border-cyber-blue border border-transparent transition-all"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon className="w-4 h-4 text-gray-400 hover:text-cyber-blue transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>100% Local • Privacy-First • No Data Collection • Open Source</p>
        </div>
      </div>
    </motion.footer>
  );
}
