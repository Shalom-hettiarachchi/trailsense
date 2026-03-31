import Link from "next/link";
import { 
  Mountain, 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <Mountain className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">TrailSense</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Your trusted partner for exploring Sri Lanka&apos;s most stunning hiking trails with expert intelligence and premium logistics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Browse Hikes", href: "/hikes" },
                { name: "Plan Your Hike", href: "/planner" },
                { name: "Gear Rentals", href: "/rentals" },
                { name: "Transport Options", href: "/transport" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 group">
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors">
                  <Mail className="h-4 w-4 text-zinc-300" />
                </div>
                <span className="hover:text-white transition-colors cursor-pointer">info@trailsense.lk</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors">
                  <Phone className="h-4 w-4 text-zinc-300" />
                </div>
                <span className="hover:text-white transition-colors cursor-pointer">+94 77 123 4567</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors">
                  <MapPin className="h-4 w-4 text-zinc-300" />
                </div>
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-6">Follow Us</h3>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "https://facebook.com" },
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Twitter, href: "https://twitter.com" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 active:scale-95"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} TrailSense. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;