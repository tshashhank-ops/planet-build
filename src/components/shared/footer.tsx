import Link from 'next/link';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-primary font-headline"
            >
              <Leaf className="h-7 w-7" />
              PlanetBuild
            </Link>
            <p className="mt-4 text-muted-foreground text-sm">
              The future of sustainable construction commerce.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Marketplace</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/marketplace" className="text-muted-foreground hover:text-primary">Buy Materials</Link></li>
              <li><Link href="/sell" className="text-muted-foreground hover:text-primary">Sell Materials</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Logistics</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Sustainability</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
             <h3 className="font-semibold text-foreground">Stay Informed</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">New Green Building Innovations</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">The Rise of Circular Economies</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Embodied Carbon Explained</Link></li>
              </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
            <p className="text-muted-foreground">&copy; {new Date().getFullYear()} PlanetBuild Marketplace. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
                <Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
