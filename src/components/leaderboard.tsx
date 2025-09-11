'use client';

import { useMemo } from 'react';
import { users } from '@/lib/mock-data';
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
  const sortedUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => b.carbonCredits - a.carbonCredits)
      .slice(0, 5);
  }, []);

  const maxCredits = sortedUsers.length > 0 ? sortedUsers[0].carbonCredits : 0;

  return (
    <div className="p-2">
      <h3 className="flex items-center gap-2 px-2 text-sm font-semibold text-sidebar-foreground/80 mb-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        Top Contributors
      </h3>
      {sortedUsers.length > 0 ? (
        <div className="space-y-4 px-2">
          {sortedUsers.map((user, index) => (
            <div key={user.id} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                 <div className="flex items-center gap-2 truncate">
                   <span className="font-semibold text-sidebar-foreground flex-shrink-0">
                    {index + 1}.
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Link href={`/profile/${user.id}`} className="flex items-center gap-2 truncate">
                            <Avatar className="h-5 w-5 flex-shrink-0">
                                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.dataAiHint} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <span className="truncate text-sidebar-foreground">{user.name}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sidebar-foreground/70 flex-shrink-0">
                  {Math.round(user.carbonCredits).toLocaleString()}
                </p>
              </div>
              <Progress
                value={(user.carbonCredits / maxCredits) * 100}
                className="h-1"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="px-2 text-xs text-sidebar-foreground/70">
          No user data available yet.
        </p>
      )}
    </div>
  );
}
