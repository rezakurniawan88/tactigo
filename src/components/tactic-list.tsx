"use client"

import ModalCreateProject from "./modal/modal-create-project";
import { useState } from "react";
import { LucideEllipsisVertical, LucideGrid, LucideList, LucideLoader2, LucideTrash } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDateLastModified } from "@/utils/dateFormatter";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import ModalChangeTitle from "./modal/modal-change-title";
import PreviewBoard from "./preview-board";

type BoardDataType = {
  uiStates: {
    showOpponents: boolean;
    showGrid: boolean;
  };
  stageData: {
    children: Array<{
      className: string;
      children: Array<PlayerGroupType>;
    }>;
  };
}

type PlayerGroupType = {
  className: string;
  attrs?: {
    x?: number;
    y?: number;
    [key: string]: unknown;
  };
  children: Array<{
    attrs: {
      fill: string;
      [key: string]: unknown;
    };
  }>;
};

type TacticType = {
  id: string;
  title: string;
  description: string;
  boardType: string;
  boardData: BoardDataType;
  isPublic: boolean,
  isArchived: boolean,
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export default function TacticList() {
  const session = useSession();
  const [layoutView, setLayoutView] = useState<"grid" | "list">("grid");
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);

  const handleLayoutChange = (view: "grid" | "list") => {
    setLayoutView(view);
  }

  const { data: dataTactics, isPending: dataTacticsIsLoading, refetch: refetchDataTactics } = useQuery({
    queryKey: ["fetchTactics"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/users/${session?.data?.user?.id}/items`);
      return response?.data?.data;
    },
    enabled: !!session?.data?.user?.id
  })

  const { mutate: handleDeleteTactic, isPending: deleteTacticIsLoading } = useMutation({
    mutationKey: ['delete-tactic'],
    mutationFn: async (tacticId: string) => {
      const response = await axiosInstance.delete(`/board/${tacticId}`);
      return response?.data?.message;
    },
    onSuccess: (msg) => {
      toast(msg);
      refetchDataTactics();
      setAlertDialogOpen(false);
    },
    onError: (error) => {
      toast("Failed to delete tactic. Please try again.");
      console.log("Delete tactic error:", error);
    }
  })

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Recent Projects</h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Create and manage your tactical boards</p>
        </div>
        <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200">
          <button onClick={() => handleLayoutChange("grid")} className={`px-3 py-1.5 text-sm rounded-md cursor-pointer ${layoutView === "grid" ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
            <LucideGrid className="w-5 h-5" />
          </button>
          <button onClick={() => handleLayoutChange("list")} className={`px-3 py-1.5 text-sm rounded-md cursor-pointer ${layoutView === "list" ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
            <LucideList className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={`${layoutView === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : layoutView === "list" ? "grid grid-rows-1 gap-6" : null}`}>
        <ModalCreateProject layoutView={layoutView} />

        {dataTacticsIsLoading ? (
          <>
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl overflow-hidden border border-slate-200">
                <div className="h-40 bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3" />
                  <div className="flex items-center justify-between pt-4">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : dataTactics?.map((tactic: TacticType) => (
          <div key={tactic.id} className="relative">
            <Link href={`/tactic/${tactic.id}`}>
              <div className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all hover:shadow-slate-200 border border-slate-200">
                <div className={`h-40 bg-slate-100 relative ${layoutView === "grid" ? "block" : layoutView === "list" ? "hidden" : null}`}>
                  <PreviewBoard
                    boardData={tactic?.boardData}
                    width={500}
                    height={160}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-800">{tactic.title}</h3>
                  <span className={`w-fit text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full ${layoutView === "grid" ? "hidden" : layoutView === "list" ? "block mt-2 mb-3" : null}`}>
                    {tactic.boardType.charAt(0).toUpperCase() + tactic.boardType.slice(1)}
                  </span>
                  <p className="text-sm text-slate-500 mt-1">{tactic.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-400">
                      {tactic.updatedAt ? formatDateLastModified(tactic.updatedAt) : "Last Modified N/A"}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full ${layoutView === "grid" ? "block" : layoutView === "list" ? "hidden" : null}`}>
                      {tactic.boardType.charAt(0).toUpperCase() + tactic.boardType.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            <Popover>
              <PopoverTrigger asChild>
                <button className="absolute top-3 right-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-full cursor-pointer">
                  <LucideEllipsisVertical className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-32 mt-1 mr-24 p-1">
                <div className="space-y-1">
                  <ModalChangeTitle refetch={refetchDataTactics} tacticId={tactic.id} />
                  <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <div className="w-full flex items-center gap-2 text-xs p-2 text-red-600 hover:text-red-800 transition-colors rounded-md hover:bg-gray-100 cursor-pointer">
                        <LucideTrash className="w-3 h-3 text-red-600" />
                        <h1 className="text-red-600">Delete</h1>
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete your tactic data permanently
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTactic(tactic.id)} disabled={deleteTacticIsLoading} className="bg-red-500 hover:bg-red-600">{deleteTacticIsLoading ?
                          <div className="flex items-center gap-2">
                            <h1>Delete</h1>
                            <LucideLoader2 className="animate-spin w-4 h-4" />
                          </div> : "Delete"}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
    </main>
  )
}
