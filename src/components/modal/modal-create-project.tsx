"use client"

import { LucideLoader2, LucidePlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialogHeader } from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import useModalStore from "@/stores/useModalStore";

export default function ModalCreateProject({ layoutView }: { layoutView: string }) {
    const session = useSession();
    const router = useRouter();
    const { modalCreateTacticIsOpen, setModalCreateTacticIsOpen } = useModalStore((state) => state);
    const boardCategory = [
        { id: "football", name: "Football" },
        // {id: "basketball", name: "Basketball"}
    ];

    const formSchema = z.object({
        title: z.string().min(2, "Title must be at least 2 characters long"),
        description: z.string().optional(),
        boardType: z.string().min(1, "Please select a board"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            boardType: "football",
        },
    });

    const { mutate: handleCreateTactic, isPending: createTacticIsLoading } = useMutation({
        mutationKey: ['create-tactic'],
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const response = await axiosInstance.post("/board", {
                title: values.title,
                description: values.description || "",
                boardType: values.boardType,
                boardData: {
                    "uiStates": {
                        "showBall": false,
                        "showGrid": false,
                        "showNumbers": false,
                        "showOpponents": false,
                        "selectedFormation": "4-3-3"
                    }
                },
                userId: session.data?.user?.id
            });

            return response?.data?.data;
        },
        onSuccess: (data) => {
            form.reset();
            toast("Tactic created successfully!");
            router.push(`/tactic/${data?.id}`);
            setModalCreateTacticIsOpen(false);
        },
        onError: (error) => {
            toast("Failed to create tactic. Please try again.");
            console.log("Create tactic error:", error);
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        handleCreateTactic(values);
    }

    return (
        <Dialog open={modalCreateTacticIsOpen} onOpenChange={setModalCreateTacticIsOpen}>
            <DialogTrigger asChild>
                <div className={`border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center hover:border-emerald-500/50 hover:bg-emerald-50/50 cursor-pointer transition-all group ${layoutView === "grid" ? "flex-col h-52 sm:h-[280px]" : layoutView === "list" ? "w-full h-32 flex-row gap-6" : null}`}>
                    <div className={`rounded-full bg-emerald-100 flex items-center justify-center ${layoutView === "grid" ? "w-14 sm:w-16 h-14 sm:h-16 mb-4" : layoutView === "list" ? "w-14 h-14 mb-0" : null} group-hover:bg-emerald-200 transition-colors`}>
                        <LucidePlus className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-600" />
                    </div>
                    <div className={`${layoutView === "grid" ? "text-center" : layoutView === "list" ? "text-left" : null}`}>
                        <span className="text-sm font-medium text-slate-600">Create New Project</span>
                        <p className={`text-xs text-slate-400 text-center ${layoutView === "grid" ? "mt-2" : layoutView === "list" ? "mt-0" : null}`}>Start with a blank tactical board</p>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Set up your new tactical board with a name and description.
                    </DialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm mb-2 text-gray-500">Tactical Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your tactical name ..."
                                                className="py-4 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm mb-2 text-gray-500">Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Description of your tactic ..."
                                                className="py-4 rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="boardType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm mb-2 text-gray-500">Board</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                defaultValue={field.value}>
                                                <SelectTrigger className="w-full p-2">
                                                    <SelectValue placeholder="Select a board" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Board</SelectLabel>
                                                        {boardCategory.map((board, index) => (
                                                            <SelectItem key={index} value={board.id}>{board.name}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={createTacticIsLoading} className="mt-2 bg-emerald-500 hover:bg-emerald-400">{createTacticIsLoading ?
                                    (
                                        <div className="flex items-center gap-2">
                                            <h1>Create Project</h1>
                                            <LucideLoader2 className="animate-spin" />
                                        </div>
                                    )
                                    : "Create Project"}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
