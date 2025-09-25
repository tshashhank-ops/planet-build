'use client';

import { useEffect, useState, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Leaderboard() {
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrgs() {
      setLoading(true);
      try {
        const res = await fetch('/api/organisations');
        if (!res.ok) throw new Error('Failed to fetch organisations');
        const data = await res.json();
        setOrganisations(data.data || []);
      } catch {
        setOrganisations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  const sortedOrgs = useMemo(() => {
    return [...organisations]
      .sort((a, b) => (b.carbonCredits || 0) - (a.carbonCredits || 0))
      .slice(0, 5);
  }, [organisations]);

  const maxCredits = sortedOrgs.length > 0 ? sortedOrgs[0].carbonCredits || 0 : 0;

  return (
    <div className="p-2">
      <h3 className="flex items-center gap-2 px-2 text-sm font-semibold text-sidebar-foreground/80 mb-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        Top Contributors
      </h3>
      {loading ? (
        <p className="px-2 text-xs text-sidebar-foreground/70">Loading...</p>
      ) : sortedOrgs.length > 0 ? (
        <div className="space-y-4 px-2">
          {sortedOrgs.map((org, index) => (
            <div key={org._id || org.id} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-sidebar-foreground flex-shrink-0">
                    {index + 1}.
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/organisations/${org._id || org.id}`} className="flex items-center gap-2 truncate">
                          <Avatar className="h-5 w-5 flex-shrink-0">
                            <AvatarImage src={org.logo} alt={org.name} />
                            <AvatarFallback>{org.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate text-sidebar-foreground">{org.name}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{org.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sidebar-foreground/70 flex-shrink-0">
                  {Math.round(org.carbonCredits || 0).toLocaleString()}
                </p>
              </div>
              <Progress
                value={maxCredits ? ((org.carbonCredits || 0) / maxCredits) * 100 : 0}
                className="h-1"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="px-2 text-xs text-sidebar-foreground/70">
          No organisation data available yet.
        </p>
      )}
    </div>
  );
}
