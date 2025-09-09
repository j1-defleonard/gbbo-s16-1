
"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BakeoffLogo } from "@/components/BakeoffLogo";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { logIn, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(!loading && user) {
        router.push('/');
    }
  }, [user, loading, router]);


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <BakeoffLogo />
            </div>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>Sign in to continue to the Bake Off Fantasy League</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={logIn} className="w-full">
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
