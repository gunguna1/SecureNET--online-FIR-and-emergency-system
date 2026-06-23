import { Shield, MessageCircle, Linkedin, Github, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="relative z-50 border-t border-surface-border bg-[#050505] py-16 px-8 flex flex-col items-center justify-center text-center mt-auto w-full">
      <Shield className="w-10 h-10 text-white mb-6 opacity-20" />
      
      <h2 className="font-heading font-black text-4xl text-white uppercase tracking-tighter mb-10">
        Contact Us
      </h2>

      {/* Socials */}
      <div className="flex items-center gap-6 mb-8">
        <a href="https://wa.me/919256857504" target="_blank" rel="noopener noreferrer" className="p-3 rounded bg-surface border border-surface-border text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all">
          <MessageCircle className="w-5 h-5" />
        </a>
        <a href="https://www.linkedin.com/in/anshik-yadav-681664287/" target="_blank" rel="noopener noreferrer" className="p-3 rounded bg-surface border border-surface-border text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href="https://github.com/gunguna1" target="_blank" rel="noopener noreferrer" className="p-3 rounded bg-surface border border-surface-border text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all">
          <Github className="w-5 h-5" />
        </a>
        <a href="https://www.instagram.com/anshqk/" target="_blank" rel="noopener noreferrer" className="p-3 rounded bg-surface border border-surface-border text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all">
          <Instagram className="w-5 h-5" />
        </a>
      </div>

      <p className="text-xs font-heading font-bold text-muted uppercase tracking-widest">
        Vanguard Operations Command © 2026 SecureNet Technologies.
      </p>
    </footer>
  );
}
