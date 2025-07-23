"use client";

import { LucideLoader2, LucideLogOut, LucidePlus } from "lucide-react";
import SearchBar from "./search-bar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useState } from "react";
import useModalStore from "@/stores/useModalStore";

export default function Navbar({ session }: any) {
    console.log("session", session);
    const acronymUser = session?.user?.name?.split(/\s+/g).slice(0, 2).map((word: string | number[]) => word[0]).join('').toUpperCase();
    const [logoutIsLoading, setLogoutIsLoading] = useState<boolean>(false);
    const { setModalCreateTacticIsOpen } = useModalStore((state) => state);

    const handleLogout = () => {
        setLogoutIsLoading(true);
        signOut({
            callbackUrl: "/auth/login"
        }).finally(() => {
            setLogoutIsLoading(false);
        })
    }

    return (
        <nav className="border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            <Link href="/">
                <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-emerald-600">TactiGo</h1>
                    <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 rounded-full">Beta</span>
                </div>
            </Link>

            <SearchBar />

            {!session ? (
                <div className="space-x-3">
                    <Link href="/auth/login">
                        <Button className="p-5 bg-gradient-to-b from-slate-50 to-slate-100 text-gray-700 cursor-pointer hover:to-slate-200">Login</Button>
                    </Link>
                    <Link href="/auth/register">
                        <Button className="p-5 bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600">Get started</Button>
                    </Link>

                </div>
            ) : (
                <div className="flex items-center space-x-8">
                    <button onClick={() => setModalCreateTacticIsOpen(true)} className="hidden sm:flex items-center bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-emerald-600 transition-all  space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer hover:transform hover:scale-105">
                        <LucidePlus className="w-4 h-4" />
                        <span>New Project</span>
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="w-12 h-12 flex justify-center items-center bg-green-500 rounded-full ring-2 ring-emerald-500/20 overflow-hidden cursor-pointer hover:ring-emerald-500/50 transition-all">
                                <h1 className="text-white font-semibold">{acronymUser}</h1>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 mt-1 mr-8">
                            <DropdownMenuLabel>{session?.user?.name || "John Doe"}</DropdownMenuLabel>
                            <p className="text-xs text-gray-400 px-2 -mt-2 mb-3">{session?.user?.email || "john@example.com"}</p>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuItem>Subscription</DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="w-full flex items-center gap-2 text-sm p-2 text-red-600 hover:text-red-800 transition-colors rounded-md hover:bg-gray-100">
                                        <LucideLogOut className="w-4 h-4 text-red-600" />
                                        <h1 className="text-red-600">Logout</h1>
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you sure you want to logout?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will end your current session and you will need to log in again to access your projects.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600">{logoutIsLoading ?
                                            <div className="flex items-center gap-2">
                                                <h1>Logout</h1>
                                                <LucideLoader2 className="animate-spin w-4 h-4" />
                                            </div> : "Logout"}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </nav>
    )
}
