import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import OrderDetails from './OrderDetails'

interface PageProps {
  params: {
    id: string
  }
}

const Page = async ({ params }: PageProps) => {
  const { id } = params
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    redirect('/api/auth/login')
  }

  // Get order with details
  const order = await db.order.findFirst({
    where: {
      id,
      userId: user.id,
      isPaid: true,
    },
    include: {
      configuration: true,
      shippingAddress: true,
      billingAddress: true,
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <MaxWidthWrapper>
      <OrderDetails order={order} />
    </MaxWidthWrapper>
  )
}

export default Page
