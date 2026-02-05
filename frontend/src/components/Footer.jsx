import { Mail, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full mt-12 py-8 border-t border-purple-500/20 bg-black/40 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-6 text-gray-400">
                <a
                    href="mailto:paybackoff5@gmail.com"
                    className="flex items-center gap-2 hover:text-cyan-400 transition-colors duration-300 group"
                >
                    <div className="p-2 rounded-full bg-purple-900/30 group-hover:bg-cyan-900/30 border border-purple-500/30 group-hover:border-cyan-400/50 transition-all">
                        <Mail size={18} />
                    </div>
                    <span className="text-sm font-mono">paybackoff5@gmail.com</span>
                </a>

                <div className="hidden md:block w-px h-4 bg-gray-700"></div>

                <a
                    href="https://www.linkedin.com/in/aaryan-3455a7289?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-pink-400 transition-colors duration-300 group"
                >
                    <div className="p-2 rounded-full bg-purple-900/30 group-hover:bg-pink-900/30 border border-purple-500/30 group-hover:border-pink-400/50 transition-all">
                        <Linkedin size={18} />
                    </div>
                    <span className="text-sm font-mono">Connect on LinkedIn</span>
                </a>
            </div>
            <div className="text-center mt-4 text-xs text-gray-600 font-mono">
                © {new Date().getFullYear()} PAYBACK SYSTEM. ALL RIGHTS RESERVED.
            </div>
        </footer>
    );
}
