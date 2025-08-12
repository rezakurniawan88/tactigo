import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params;
    const { newTitle } = await req.json();

    try {
        if(!id) {
            return NextResponse.json({ message: "Board ID is required" }, { status: 400 });
        }

        const tactic = await prisma.tactic.update({
            where: { id },
            data: { title: newTitle }
        });

        if(!tactic) {
            return NextResponse.json({ message: "Change title error" }, { status: 400 });
        }

        return NextResponse.json({
            data: tactic,
            message: "Change title successfully"
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
        console.log(error, "BOARD_CHANGE_TITLE_ERROR");
    }
}