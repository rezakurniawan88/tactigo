import Navbar from "@/components/navbar";
import SearchPageTacticList from "@/components/search-page-tactic-list";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function SearchPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar session={session} />
            <SearchPageTacticList />
        </div>
    )
}
