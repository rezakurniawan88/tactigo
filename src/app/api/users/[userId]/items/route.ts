import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }>}) {
    try {
        const { userId } = await params;
        if(!userId) {
            return NextResponse.json({ message: "UserID is required" }, { status: 400 });
        };

        const tactic = await prisma.tactic.findMany({
            where: { userId },
            orderBy: {
                updatedAt: "desc"
            }
        });

        return NextResponse.json({
            data: tactic,
            message: "Tactics retrieved successfully"
        },
        {
            status: 200
        });

    } catch (error) {
        if(error instanceof Error) {
            return NextResponse.json({
                status: "error",
                message: error.message
            },
            {
                status: 500
            }
        )}
        console.log(error, "TACTIC_GET_DATA_ERROR");
    }
}