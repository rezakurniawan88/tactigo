import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useFetchDataBoard = (id: string) => {
    return useQuery({
            queryKey: ['board', id],
            queryFn: async () => {
                const response = await axiosInstance.get(`/board/${id}`);
                return response?.data?.data;
            },
            enabled: !!id
        });
}