import { prisma } from './lib/prisma';

async function checkPayment() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: 'Thioro', mode: 'insensitive' } },
        { lastName: { contains: 'Thioro', mode: 'insensitive' } },
        { firstName: { contains: 'Gueye', mode: 'insensitive' } },
        { lastName: { contains: 'Gueye', mode: 'insensitive' } }
      ]
    },
    include: {
      company: {
        include: {
          subscriptionPayments: true
        }
      }
    }
  });
  
  console.log(JSON.stringify(users, null, 2));
}

checkPayment()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
