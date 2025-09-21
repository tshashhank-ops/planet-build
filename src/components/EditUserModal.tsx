import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState, useEffect } from 'react';
import type { User } from '@/lib/types';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  organisationName?: string;
  onSave: (updatedFields: Partial<User>) => void;
}

export default function EditUserModal({ open, onOpenChange, user, organisationName, onSave }: EditUserModalProps) {
    const [form, setForm] = useState<{
        name: string;
        email: string;
        passwordHash: string;
        role: 'buyer' | 'seller' | 'staff' | '';
        memberSince: string;
        avatar: string;
    }>({
        name: '',
        email: '',
        passwordHash: '',
        role: '',
        memberSince: '',
        avatar: '',
        });
  const [loading, setLoading] = useState(false);

  // Prefill form with user data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        passwordHash: user.passwordHash || '',
        role: user.role || '',
        memberSince: user.memberSince || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await fetch(`/api/users/${user._id}`, { method: 'DELETE' });
      setLoading(false);
      onOpenChange(false);
    } catch (err) {
      console.error('Delete failed:', err);
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = { ...user, ...form } as Partial<User>; 
      await onSave(updatedUser);
      setLoading(false);
      onOpenChange(false);
    } catch (err) {
      console.error('Save failed:', err);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            ✏️ Edit User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Name</label>
              <Input name="name" value={form.name} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <Input name="email" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Password</label>
              <Input
                name="passwordHash"
                type="password"
                value={form.passwordHash}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border rounded-md px-2 py-2 text-sm"
              >
                <option value="">-- Select Role --</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Member Since</label>
              <Input
                name="memberSince"
                type="date"
                value={form.memberSince}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600">Organisation</label>
              <Input
                value={organisationName || ''}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Avatar URL</label>
            <Input name="avatar" value={form.avatar} onChange={handleChange} />
          </div>
        </form>

        <DialogFooter className="mt-6 flex justify-between">
          

          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-800 text-white"
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
            <Button
              className="bg-green-500 hover:bg-green-800 text-white"
              type="submit"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
