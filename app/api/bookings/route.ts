import { NextRequest,NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs"; 
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
   try {
    const body = await request.json()
    const { name, email, slotId } = body

    if (!name || !email || !slotId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    const slot = await prisma.experienceSlot.findUnique({
      where: { id: slotId },
    })

    if (!slot) {
      return NextResponse.json({ error: "Invalid slot ID" }, { status: 404 })
    }

    if (!slot.isAvailable || slot.bookedCount >= slot.capacity) {
      return NextResponse.json(
        { error: "Slot is full or unavailable" },
        { status: 400 }
      )
    }
    const booking = await prisma.booking.create({
      data: {
        customerName: name,
        customerEmail: email,
        slotId,
        status: "BOOKED",
      },
    })
    await prisma.experienceSlot.update({
      where: { id: slotId },
      data: { bookedCount: { increment: 1 } },
    })

    return NextResponse.json(
      {
        message: "Booking confirmed",
        bookingId: booking.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/bookings failed:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }finally{
        await prisma.$disconnect()
    }
}