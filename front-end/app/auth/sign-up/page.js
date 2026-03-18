"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// import { SEO_CONFIG } from "~/app";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/primitives/button";
import { Card, CardContent } from "@/primitives/card";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Separator } from "@/primitives/separator";

export default function SignUpPageClient() {

  const { register } = useAuth();
  const router = useRouter();
  
const [email, setEmail] = useState("");
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [password, setPassword] = useState("")

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

 
 
  try {
    await register(firstName,
    lastName,
    email,
    password
  );

    router.push("/");
  } catch (err) {
    setError("Registration failed. Please try again.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};





  //   const handleGoogleSignUp = () => {
  //     setLoading(true);
  //     try {
  //       void signIn.social({ provider: "google" });
  //     } catch (err) {
  //       setError("Failed to sign up with Google");
  //       console.error(err);
  //       setLoading(false);
  //     }
  //   };

  return (
    <div
      className={`
        grid h-screen w-screen
        md:grid-cols-2
      `}
    >
      {/* Left side - Image */}
      <div
        className={`
          relative hidden
          md:block
        `}
      >
        <Image
          alt="Sign-up background image"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 0vw, 50vw"
          src="https://images.unsplash.com/photo-1719811059181-09032aef07b8?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3"
        />
        <div
          className={`
            absolute inset-0 bg-gradient-to-t from-background/80 to-transparent
          `}
        />
        {/* <div className="absolute bottom-8 left-8 z-10 text-white"> 
          <h1 className="text-3xl font-bold">{SEO_CONFIG.name}</h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            {SEO_CONFIG.slogan}
          </p>
        </div>

        */}
      </div>

      {/* Right side - Sign up form */}
      <div
        className={`
          flex items-center justify-center p-4
          md:p-8
        `}
      >
        <div className="w-full max-w-md space-y-4">
          <div
            className={`
              space-y-4 text-center
              md:text-left
            `}
          >
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to create your account
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-2">
              <form className="space-y-4" onSubmit={handleSubmit}>
<div className="grid gap-2">
  <Label htmlFor="firstName">First name</Label>
  <Input
    id="firstName"
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    placeholder="John"
    required
  />
</div>

<div className="grid gap-2">
  <Label htmlFor="lastName">Last name</Label>
  <Input
    id="lastName"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    placeholder="Doe"
    required
  />
</div>

<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="name@example.com"
    required
  />
</div>

<div className="grid gap-2">
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
</div>

                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              {/* <div className="mt-6 grid grid-cols-2 gap-4">
                <Button
                  className="flex items-center gap-2"
                  disabled={loading}
                  onClick={handleGoogleSignUp}
                  variant="outline"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Google
                </Button>
              </div> */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  className={`
                    text-primary underline-offset-4
                    hover:underline
                  `}
                  href="/auth/sign-in"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
