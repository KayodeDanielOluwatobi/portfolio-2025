import WeatherWidget from '@/components/ui/WeatherWidget';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white border-t border-white/10">
      <div className="container mx-auto px-8 py-12 max-w-none">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left section - Weather widgets stacked */}
          <div className="md:col-span-6 flex flex-col gap-6">
            {/* Lagos Widget */}
            <WeatherWidget 
              city="Lagos" 
              country="Nigeria" 
              countryCode="NG"
              showCelsius={true}
            />

            {/* Seoul Widget */}
            <WeatherWidget 
              city="Seoul" 
              country="South Korea" 
              countryCode="KR"
              showCelsius={true}
            />
          </div>

          {/* Right section - Links/Info */}
          <div className="md:col-span-6 flex flex-col md:flex-row md:justify-end gap-8">
            {/* Social Links */}
            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-xs text-white/40 uppercase tracking-wider">
                Connect
              </h3>
              <div className="flex flex-col gap-2 font-mono text-sm uppercase">
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-xs text-white/40 uppercase tracking-wider">
                Contact
              </h3>
              <div className="flex flex-col gap-2 font-mono text-sm uppercase">
                <a href="mailto:hello@example.com" className="text-white/70 hover:text-white transition-colors">
                  Email
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Book a Call
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-white/40">
            © {new Date().getFullYear()} Daniel Everdann. All rights reserved.
          </p>
          <p className="font-mono text-xs text-white/40">
            Designed & Developed with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}