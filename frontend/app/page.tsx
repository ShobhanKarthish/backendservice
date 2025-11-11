// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Data Governance Console</h1>
        <p className="text-xl text-muted-foreground">
          Manage users, preferences, and posts with ease
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Create, update, and manage user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/users')} className="w-full">
              View All Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              What you can do with this console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Create and manage users</li>
              <li>✓ View user details and posts</li>
              <li>✓ Manage user preferences</li>
              <li>✓ Soft delete with 24-hour grace period</li>
              <li>✓ Paginated user lists</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
