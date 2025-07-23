"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { LucideLoader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";


export default function RegisterPage() {
    const router = useRouter();

    const formSchema = z.object({
        username: z.string().min(3, "Username must be at least 3 characters long"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(3, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(3, "Confirm Password must be at least 6 characters long").refine((data) => data.password === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        })
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
    });

    const { mutate: handleRegister, isPending: registerIsLoading } = useMutation({
        mutationKey: ['register'],
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const response = await axiosInstance.post("/register", {
                username: values.username,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            return response?.data?.message;
        },
        onSuccess: (message) => {
            toast(message || "Register successful!");
            router.push("/auth/login");
        },
        onError: (error) => {
            toast(error?.message || "Register failed. Please try again.");
            console.log("Register error:", error);
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        handleRegister(values);
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
                        <p className="text-sm text-gray-500">Please enter your details to create an account.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Enter your username"
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
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Confirm Password</FormLabel>
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

                            <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 font-medium">{registerIsLoading ? <LucideLoader2 className="animate-spin" /> : "Create account"}</Button>

                            <p className="text-center text-gray-600">Already have an account? <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Sign in</Link>
                            </p>
                        </form>
                    </Form>
                </div>
            </div>
        </main>
    )
}
