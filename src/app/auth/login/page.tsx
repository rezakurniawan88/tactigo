"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LucideLoader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";


export default function LoginPage() {
    const router = useRouter();

    const formSchema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password must be at least 6 characters long"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    });

    const { mutate: handleLogin, isPending: loginIsLoading } = useMutation({
        mutationKey: ['login'],
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            return await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: "/"
            });
        },
        onSuccess: (response) => {
            if (response?.ok) {
                toast("Login successful!");
                router.push("/");
            } else {
                toast("Login failed. Please check your credentials.");
            }
        },
        onError: (error) => {
            toast(error?.message || "Login failed. Please try again.");
            console.log("Login error:", error);
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        handleLogin(values);
        console.log(values);
    }

    return (
        <main className="flex min-h-screen">
            <div className="hidden lg:flex w-1/2 bg-emerald-50 justify-center items-center p-12">
                <div className="max-w-lg">
                    <h2 className="text-4xl font-bold text-emerald-800 mb-6">Welcome to TactiGo</h2>
                    <p className="text-emerald-600 text-lg">Your ultimate platform for strategic planning and execution.</p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-4">
                <div className="w-full max-w-md space-y-8 p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back to TactiGo</h1>
                        <p className="text-sm text-gray-500">Login to continue your journey</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="example@email.com"
                                                className="py-6 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="py-6 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="remember_me"
                                        id="remember_me"
                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <label htmlFor="remember_me" className="text-sm text-gray-600">Remember me</label>
                                </div>
                                <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-800 transition-colors">Forgot password?</Link>
                            </div>

                            <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 font-medium">{loginIsLoading ? <LucideLoader2 className="animate-spin" /> : "Log in"}</Button>

                            <p className="text-center text-gray-600">Don&apos;t have an account? <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Create account</Link>
                            </p>
                        </form>
                    </Form>
                </div>
            </div>
        </main>
    )
}
