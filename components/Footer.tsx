import Link from "next/link";
import { 
  Mountain, 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      
      {/* Subtle Background Watermark */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <Mountain className="absolute -bottom-24 -right-12 w-96 h-96 text-white opacity-5 transform -rotate-12" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
                <Mountain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                TrailSense
              </span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-xs">
              Your trusted partner for exploring Sri Lanka&apos;s untamed wilderness with expert intelligence and premium logistics.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-primary-foreground/60 font-bold uppercase tracking-widest text-xs mb-6">
              Expedition Menu
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                { name: "Browse Hikes", href: "/hikes" },
                { name: "Plan Your Hike", href: "/planner" },
                { name: "Gear Rentals", href: "/rentals" },
                { name: "Transport Options", href: "/transport" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-primary-foreground/90 hover:text-white hover:translate-x-1 flex items-center gap-2 transition-all duration-300 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Headquarters Contact */}
          <div>
            <h3 className="text-primary-foreground/60 font-bold uppercase tracking-widest text-xs mb-6">
              Headquarters
            </h3>
            <ul className="space-y-4 text-sm text-primary-foreground/90">
              <li className="flex items-center gap-3 group">
                <div className="bg-white/10 p-2 rounded-lg border border-white/10 group-hover:bg-white/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="hover:text-white transition-colors cursor-pointer">info@trailsense.lk</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="bg-white/10 p-2 rounded-lg border border-white/10 group-hover:bg-white/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="hover:text-white transition-colors cursor-pointer">+94 77 123 4567</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="bg-white/10 p-2 rounded-lg border border-white/10 group-hover:bg-white/20 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>

          {/* Intelligence Network (Socials) */}
          <div>
            <h3 className="text-primary-foreground/60 font-bold uppercase tracking-widest text-xs mb-6">
              Network
            </h3>
            <p className="text-xs text-primary-foreground/70 mb-4 font-medium">Join our field agents</p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "https://facebook.com" },
                { Icon: Instagram, href: "https://instagram.com" },
                { Icon: Twitter, href: "https://twitter.com" },
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-3 rounded-2xl border border-white/20 text-white hover:bg-white hover:text-primary transition-all duration-300 active:scale-95 shadow-sm"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="border-t border-white/20 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-primary-foreground/70 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} TrailSense. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;