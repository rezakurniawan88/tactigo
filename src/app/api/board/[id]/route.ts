import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params;
    
    try {
        if(!id) {
            return NextResponse.json({ message: "Board ID is required" }, { status: 400 });
        }

        const tactic = await prisma.tactic.findUnique({
            where: { id },
        });

        if(!tactic) {
            return NextResponse.json({ message: "Board not found" }, { status: 404 });
        }
        
        return NextResponse.json({
            data: tactic,
            message: "Board retrieved successfully"
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
        console.log(error, "BOARD_GET_DATA_ERROR");
    }
}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params;
    const { boardData } = await req.json();

    try {
        if(!id) {
            return NextResponse.json({ message: "Board ID is required" }, { status: 400 });
        }

        const tactic = await prisma.tactic.update({
            where: { id },
            data: { boardData }
        });

        if(!tactic) {
            return NextResponse.json({ message: "Save formation error" }, { status: 400 });
        }

        return NextResponse.json({
            data: tactic,
            message: "Save formation successfully"
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
        console.log(error, "BOARD_SAVE_FORMATION_ERROR");
    }
}

export async function DELETE(req: Request, { params } : { params: Promise<{ id: string }>}) {
    const { id } = await params;

    try {
        const tactic = await prisma.tactic.delete({
            where: { id }
        });

        if(!id) {
            return NextResponse.json({ message: "Board ID is required" }, { status: 400 });
        }

        return NextResponse.json({
            data: tactic,
            message: "Delete tactic successfully"
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
        console.log(error, "BOARD_DELETE_ERROR");       
    }
}