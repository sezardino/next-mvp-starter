import { ProjectUrls } from "@/const/url";
import prismaClient from "@/libs/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();

  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const clerkUser = await currentUser();
  if (!clerkUser) return redirect(ProjectUrls.registration);

  const user = await prismaClient.user.findUnique({
    where: { id: clerkUser.id },
  });

  if (!user) {
    try {
      await prismaClient.user.create({
        data: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0].emailAddress,
        },
      });
    } catch (error) {
      console.log(error);
      return redirect(ProjectUrls.registration);
    }
  }

  return redirect(ProjectUrls.home);
}
