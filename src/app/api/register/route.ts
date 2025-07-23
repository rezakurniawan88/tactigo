import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { username, email, password, confirmPassword } = await req.json();
        if(password !== confirmPassword) return NextResponse.json({ message: "Password and Confirm Password must be the same"}, { status: 400});
        const hashPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashPassword
            }
        });

        return NextResponse.json({
            data: user,
            message: "User created successfully"
        },
        {
            status: 201
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
        console.log(error, "REGISTER_ERROR");
    }
}