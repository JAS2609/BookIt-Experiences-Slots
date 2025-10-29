import { NextResponse ,NextRequest } from "next/server"
import { PrismaClient} from "@prisma/client"
export const runtime = "nodejs"; 
const prisma=new PrismaClient()
export async function GET(
  request: NextRequest,
  { params }: {
  params: Promise<{ id: string }>;
}) {
 const { id } = await params;
  try {
    const experience = await prisma.experience.findUnique({
       where: { id},
      include: {
       dates: {
        include:{
          timeSlots:true
        }
       },
    },
  });

    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 })
    }

    return NextResponse.json(experience)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
