// app/users/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUserDetails } from '@/hooks/useUserDetails';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Shield, 
  User as UserIcon,
  Settings,
  FileText,
  Bell,
  Globe,
  Palette
} from 'lucide-react';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const { user, posts, preferences, loading, error } = useUserDetails(userId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64 md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.push('/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <Alert>
            <AlertDescription>User not found</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.push('/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/users')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>

        {/* User Header Card */}
        <Card className="mb-6 shadow-xl border-t-4 border-t-blue-500">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-lg">
                <AvatarFallback className={`${getRoleColor(user.role)} text-2xl font-bold`}>
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{user.username}</h1>
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className="gap-1 text-sm"
                  >
                    {user.role === 'admin' ? (
                      <Shield className="h-3 w-3" />
                    ) : (
                      <UserIcon className="h-3 w-3" />
                    )}
                    {user.role}
                  </Badge>
                </div>
                
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
                Profile Information
              </CardTitle>
              <CardDescription>Detailed user account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-muted-foreground">User ID</span>
                  <span className="text-sm font-mono">{user._id}</span>
                </div>
                <div className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-muted-foreground">Username</span>
                  <span className="text-sm font-semibold">{user.username}</span>
                </div>
                <div className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-muted-foreground">Created</span>
                  <span className="text-sm">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                  <span className="text-sm">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                User Preferences
              </CardTitle>
              <CardDescription>Settings and configurations</CardDescription>
            </CardHeader>
            <CardContent>
              {preferences ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Theme</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {preferences.theme}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Language</span>
                    </div>
                    <Badge variant="outline">
                      {preferences.language.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Notifications</span>
                    </div>
                    <Badge 
                      variant={preferences.notifications ? 'default' : 'secondary'}
                    >
                      {preferences.notifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No preferences set for this user.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posts Card */}
          <Card className="md:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Posts ({posts.length})
                  </CardTitle>
                  <CardDescription>All content created by this user</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {posts.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post._id} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              Posted on {formatDate(post.createdAt)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{post.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground font-medium">No posts yet</p>
                  <p className="text-xs text-muted-foreground mt-1">This user hasn't created any content.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}