// app/users/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUserDetails } from '@/hooks/useUserDetails';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const { user, posts, preferences, loading, error, refetch } = useUserDetails(userId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert>
          <AlertDescription>User not found</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/users')}>
          Back to Users
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Basic user account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="text-sm font-mono mt-1">{user._id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="mt-1">{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge className="mt-1" variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm mt-1">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm mt-1">{formatDate(user.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* User Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>User settings and configurations</CardDescription>
          </CardHeader>
          <CardContent>
            {preferences ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Theme</p>
                  <Badge className="mt-1" variant="outline">
                    {preferences.theme}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Language</p>
                  <p className="mt-1">{preferences.language}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                  <Badge 
                    className="mt-1" 
                    variant={preferences.notifications ? 'default' : 'secondary'}
                  >
                    {preferences.notifications ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No preferences set for this user.</p>
            )}
          </CardContent>
        </Card>

        {/* User Posts Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Posts ({posts.length})</CardTitle>
            <CardDescription>All posts created by this user</CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post._id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription>
                        Posted on {formatDate(post.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{post.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
