import { NextRequest,NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code } = body
        if (!code) {
            return NextResponse.json(
                { error: "Missing promo code" },
                { status: 400 }
            )
        }
        const promo = await prisma.promoCode.findUnique({
            where: { code },
        })  
        if (!promo) {
            return NextResponse.json(
                { valid: false, message: "Invalid promo code" },
                { status: 404 }
            )
        }
        if (!promo.isActive) {
            return NextResponse.json(
                { valid: false, message: "Promo code is inactive" },
                { status: 400 }
            )
        }   
        return NextResponse.json(
            { valid: true, discountPercentage: promo.discountValue },
            { status: 200 }
        )
    } catch (error) {
        console.error("POST /api/promo/validate failed:", error)
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        )
    }finally{
        await prisma.$disconnect()
    }   
}