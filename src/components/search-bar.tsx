"use client";

import { LucideSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SearchBar() {
    const route = useRouter();

    const formSchema = z.object({
        searchValue: z.string()
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            searchValue: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        route.push(`/search?q=${values.searchValue}`)
        console.log(values);
    }

    return (
        <div className="hidden sm:block sm:flex-1 max-w-2xl mx-8 relative">
            <LucideSearch className="absolute left-4 top-3 text-slate-400 w-4 h-4" />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="searchValue"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="Search projects..."
                                        className="w-full pl-12 pr-4 py-5 text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    )
}
