import { MapPin, Mail, ExternalLink, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 flex-wrap justify-between gap-14 items-center">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-primary to-primary-light p-2 rounded-lg">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Project ECHO
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              An initiative by Enactus NSUT to promote sustainable e-waste management on campus.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Netaji Subhas University of Technology, Azad Hind Fauj Marg, Dwarka, New Delhi - 110078</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:enactus@nsut.ac.in" className="hover:text-primary transition-colors">
                  enactus@nsut.ac.in
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                About Project
              </Link>
              <Link to="/locations" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Bin Locations
              </Link>
              <a
                href="https://www.enactus.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Enactus NSUT
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Project ECHO - Enactus NSUT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}