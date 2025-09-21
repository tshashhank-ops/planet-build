import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface UserAvatarCardProps {
  avatar?: string;
  name: string;
  dataAiHint?: string;
}

export default function UserAvatarCard({ avatar, name, dataAiHint }: UserAvatarCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="flex flex-col justify-center items-center p-8">
        <CardContent className="flex justify-center w-150 h-150 bg-white hover:bg-gray-50 hover:shadow-2xl shadow-lg p-8 rounded-full ">
          <div onClick={() => setOpen(true)} className="cursor-pointer">
            <Avatar className="h-48 w-48 border-4 border-background ring-4 ring-primary">
              <AvatarImage src={avatar} alt={name} data-ai-hint={dataAiHint} />
              <AvatarFallback className="text-2xl text-green-500">{name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
        <p className="text-4xl font-bold font-small mb-2 mt-4">{name}</p>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col items-center justify-center">
            <DialogTitle className="sr-only">User Avatar Preview</DialogTitle>
          <Avatar className="h-120 w-120 border-4 border-background ring-4 ring-primary">
            <AvatarImage src={avatar} alt={name} data-ai-hint={dataAiHint} />
            <AvatarFallback className="text-4xl">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-4xl font-bold font-small mb-2 mt-4">{name}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
