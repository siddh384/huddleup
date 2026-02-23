"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

export default function AuthCard({
  title,
  description,
  mode = "sign-in",
}: {
  title: string;
  description: string;
  mode?: "sign-in" | "sign-up";
}) {
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "facility_owner">("user");

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="w-full max-w-md"
    >
      <Card className="w-full rounded-none border-dashed overflow-hidden">
        <CardHeader>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardDescription className="text-xs md:text-sm">
              {description}
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div className="grid gap-4" variants={itemVariants}>
            <motion.form
              variants={itemVariants}
              onSubmit={async (e) => {
                e.preventDefault();
                setEmailLoading(true);
                try {
                  if (mode === "sign-in") {
                    await signIn.email(
                      {
                        email,
                        password,
                        rememberMe: true,
                        callbackURL: "/",
                      },
                      {
                        onError: (ctx) => {
                          alert(ctx.error.message ?? "Failed to sign in");
                        },
                        onResponse: () => {
                          setEmailLoading(false);
                        },
                      },
                    );
                  } else {
                    await signUp.email(
                      {
                        name,
                        email,
                        password,
                        callbackURL: "/",
                      },
                      {
                        onError: (ctx) => {
                          alert(ctx.error.message ?? "Failed to sign up");
                        },
                        onSuccess: async () => {
                          // Update user role after successful signup
                          try {
                            const response = await fetch(
                              "/api/user/update-role",
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ role }),
                              },
                            );

                            if (!response.ok) {
                              console.error("Failed to update user role");
                            }
                          } catch (error) {
                            console.error("Error updating user role:", error);
                          }
                        },
                        onResponse: () => {
                          setEmailLoading(false);
                        },
                      },
                    );
                  }
                } catch {
                  setEmailLoading(false);
                }
              }}
              className="grid gap-3"
            >
              {mode === "sign-up" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value: "user" | "facility_owner") =>
                        setRole(value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="facility_owner">
                          Facility Owner
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {mode === "sign-in" && (
                <div className="text-left">
                  <span className="text-sm text-muted-foreground">
                    Forgot your password?{" "}
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="inline-block"
                    >
                      <button
                        type="button"
                        className="text-primary ml-0.5 cursor-pointer font-medium hover:underline"
                        onClick={async () => {
                          if (!email) {
                            alert("Please enter your email first");
                            return;
                          }
                          try {
                            const { requestPasswordReset } =
                              await import("@/lib/auth-client");
                            const redirectTo = `${window.location.origin}/reset-password`;
                            const { error } = await requestPasswordReset({
                              email: email,
                              redirectTo,
                            });
                            if (error)
                              throw new Error(
                                error.message || "Failed to send reset link",
                              );
                            alert(
                              "If an account exists, a reset link has been sent to your email.",
                            );
                          } catch (e: any) {
                            alert(e?.message || "Failed to send reset link");
                          }
                        }}
                      >
                        Reset
                      </button>
                    </motion.span>
                  </span>
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={emailLoading}
              >
                <AnimatePresence mode="wait">
                  {emailLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="mr-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {mode === "sign-in" ? "Continue with Email" : "Create Account"}
              </Button>
            </motion.form>

            <div
              className={cn(
                "w-full gap-2 flex items-center",
                "justify-between flex-col",
              )}
            >
              <div className="relative w-full text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-dashed" />
                </div>
                <div className="relative inline-block bg-background px-2 text-xs text-muted-foreground">
                  Or continue with
                </div>
              </div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <SignInButton
                  title="Sign in with Github"
                  provider="github"
                  loading={githubLoading}
                  setLoading={setGithubLoading}
                  callbackURL="/"
                  icon={<Icons.Github />}
                />
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <SignInButton
                  title="Sign in with Google"
                  provider="google"
                  loading={googleLoading}
                  setLoading={setGoogleLoading}
                  callbackURL="/"
                  icon={<Icons.Google />}
                />
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-dashed pt-4">
          <motion.p
            className="text-sm text-muted-foreground"
            variants={itemVariants}
          >
            {mode === "sign-in" ? (
              <>
                Don&apos;t have an account?{" "}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-block"
                >
                  <Link
                    href="/sign-up"
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </motion.span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-block"
                >
                  <Link
                    href="/sign-in"
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </motion.span>
              </>
            )}
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

const SignInButton = ({
  title,
  provider,
  loading,
  setLoading,
  callbackURL,
  icon,
}: {
  title: string;
  provider: "github" | "google" | "discord";
  loading: boolean;
  setLoading: (loading: boolean) => void;
  callbackURL: string;
  icon: React.ReactNode;
}) => {
  const iconVariants = {
    idle: {
      scale: 1,
      rotate: 0,
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        rotate: {
          duration: 0.4,
          ease: "easeInOut" as const,
        },
        scale: {
          duration: 0.2,
          ease: "easeOut" as const,
        },
      },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const textVariants = {
    idle: { x: 0 },
    hover: {
      x: 2,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      className="w-full"
    >
      <Button
        variant="outline"
        size="lg"
        className={cn("w-full gap-2 border-dashed relative overflow-hidden")}
        disabled={loading}
        onClick={async () => {
          await signIn.social(
            {
              provider: provider,
              callbackURL: callbackURL,
            },
            {
              onRequest: () => {
                setLoading(true);
              },
            },
          );
        }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              variants={iconVariants}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.span variants={textVariants}>{title}</motion.span>

        {/* Subtle background shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
          variants={{
            idle: { translateX: "-100%" },
            hover: {
              translateX: "100%",
              transition: {
                duration: 0.6,
                ease: "easeInOut" as const,
              },
            },
          }}
        />
      </Button>
    </motion.div>
  );
};
