import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import UserProfile from './UserProfile'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'

const Page = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    redirect('/api/auth/login')
  }

  // Get user data from database
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: {
      orders: {
        where: { isPaid: true },
        orderBy: { createdAt: 'desc' },
        include: {
          configuration: true,
          shippingAddress: true,
        },
      },
    },
  })

  if (!dbUser) {
    // Handle case where user exists in Kinde but not in DB
    return (
      <MaxWidthWrapper>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="mt-4">Your profile information could not be retrieved.</p>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper>
      <UserProfile user={dbUser} kindeUser={user} />
    </MaxWidthWrapper>
  )
}

export default Page
