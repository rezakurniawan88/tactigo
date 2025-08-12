import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { title, description, boardType, boardData, userId } = await req.json();
        
        if(!userId) {
            return NextResponse.json({ message: "User ID is required"}, { status: 400 });
        }
        if(!title || !boardType) {
            return NextResponse.json({ message: "Title and Board Type are required"}, { status: 400 });
        }

        const tactic = await prisma.tactic.create({
            data: {
                title,
                description: description || "",
                boardType,
                boardData,
                userId
            }
        });

        return NextResponse.json({
            data: tactic,
            message: "Tactic created successfully"
        },
        {
            status: 201
        }
    );


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
        console.log(error, "BOARD_CREATE_ERROR");
    }
}