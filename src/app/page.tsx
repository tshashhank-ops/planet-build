import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardHat, Shirt, Cpu, Car, Sprout } from 'lucide-react';

const industries = [
    {
        name: 'Construction & Building',
        href: '/marketplace',
        icon: <HardHat className="h-10 w-10 text-primary" />,
        description: 'Trade surplus and reclaimed materials for building projects.',
        active: true
    },
    {
        name: 'Landscaping & Horticulture',
        href: '/marketplace',
        icon: <Sprout className="h-10 w-10 text-primary" />,
        description: 'Buy and sell soil, compost, plants, and hardscaping materials.',
        active: true
    },
    {
        name: 'Textiles & Apparel',
        href: '/marketplace',
        icon: <Shirt className="h-10 w-10 text-primary" />,
        description: 'Exchange raw fabrics, off-cuts, and recycled textiles.',
        active: true
    },
    {
        name: 'Electronics & Components',
        href: '/marketplace',
        icon: <Cpu className="h-10 w-10 text-primary" />,
        description: 'Source and sell electronic components and e-waste.',
        active: true
    },
    {
        name: 'Automotive Parts',
        href: '/marketplace',
        icon: <Car className="h-10 w-10 text-primary" />,
        description: 'Marketplace for new, used, and remanufactured auto parts.',
        active: true
    },
];

export default function IndustrySelectionPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
                A Global Marketplace for a Circular Economy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                PlanetBuild connects industries to sustainably trade raw and recyclable materials, reducing waste and paving the way for a greener future.
            </p>
            <p className="mt-6 text-xl font-semibold">
              Select Your Industry
            </p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => (
                <Link href={industry.active ? industry.href : '#'} key={industry.name} className={!industry.active ? 'pointer-events-none' : ''}>
                    <Card className={`h-full flex flex-col items-center text-center p-6 transition-all duration-300 ease-in-out  ${industry.active ? 'hover:shadow-xl hover:-translate-y-2 hover:border-primary cursor-pointer' : 'opacity-50 bg-secondary'}`}>
                        <CardHeader>
                            {industry.icon}
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow">
                            <CardTitle className="text-xl font-semibold">{industry.name}</CardTitle>
                            <p className="text-muted-foreground mt-2 flex-grow">{industry.description}</p>
                            {!industry.active && <p className="text-sm font-bold text-primary mt-4">Coming Soon</p>}
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
  );
}
