"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import { LucideLoader2, LucidePencil } from "lucide-react";
import { AlertDialogHeader } from "../ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function ModalChangeTitle({ refetch, tacticId }: { refetch: () => void; tacticId: string | undefined }) {
    const pathname = usePathname();
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

    const formSchema = z.object({
        newTitle: z.string().min(2, "Title must be at least 2 characters long"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newTitle: "",
        },
    });

    const { mutate: handleChangeTitle, isPending: editTitleIsLoading } = useMutation({
        mutationKey: ['board-change-title'],
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const response = await axiosInstance.patch(`/board/${tacticId}/change-title`, { newTitle: values.newTitle });

            return response?.data?.message;
        },
        onSuccess: (message) => {
            toast(message);
            form.reset();
            setModalIsOpen(false);
            refetch();
        },
        onError: (error) => {
            toast(error?.message);
            console.log("Change_title_error", error);
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        handleChangeTitle(values);
    }

    return (
        <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
            <DialogTrigger asChild>
                {pathname.includes("tactic") ? (
                    <button className="p-2.5 hover:bg-slate-100 rounded-full">
                        <LucidePencil className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-xs p-2 transition-colors rounded-md hover:bg-gray-100 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <LucidePencil className="w-3 h-3" />
                        <h1>Edit</h1>
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <DialogTitle>Change Tactic Title</DialogTitle>
                    <DialogDescription>
                        Change your old tactic title to your new title here.
                    </DialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="newTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm mb-2 text-gray-500">New Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your new tactical name ..."
                                                className="py-5 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={editTitleIsLoading} className="mt-2 bg-emerald-500 hover:bg-emerald-400">{editTitleIsLoading ?
                                    <div className="flex items-center gap-2">
                                        <LucideLoader2 className="animate-spin" />
                                        <h1>Change Title</h1>
                                    </div>
                                    : "Change Title"}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
