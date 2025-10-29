import{NextRequest,NextResponse }from "next/server"
import { PrismaClient} from "@prisma/client"

export const runtime = "nodejs"; 

const prisma=new PrismaClient()
export async function GET(request:NextRequest){

    try {
       const experiences= await prisma.experience.findMany({
            orderBy:{ createdAt:"desc" }
        })
        return NextResponse.json(experiences)
    } catch (error) {
        return NextResponse.json({message:"Internal server error"},{status:500})
    }finally{
        await prisma.$disconnect()
    }
}
