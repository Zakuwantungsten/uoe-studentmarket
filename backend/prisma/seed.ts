import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash the password 'nassor' for all accounts
  const passwordHash = await hash('nassor', 12)

  // Seed Categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Tutoring', slug: 'tutoring', icon: '📚', description: 'Academic tutoring services' },
      { name: 'Design', slug: 'design', icon: '🎨', description: 'Graphic and web design services' },
      { name: 'Programming', slug: 'programming', icon: '💻', description: 'Software development services' },
      { name: 'Writing', slug: 'writing', icon: '✍️', description: 'Content writing and editing' }
    ],
  })

  // Seed Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Side kama Side',
      email: 'admin@uoe-market.com',
      password: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      studentId: 'ADM001'
    }
  })

  // Seed Regular Users
  const [tutor, designer, programmer] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Shureim Abdallah',
        email: 'tutor@uoe-market.com',
        password: passwordHash,
        role: 'PROVIDER',
        studentId: 'TUT001',
        bio: 'Experienced mathematics tutor',
        title: 'Mathematics Tutor'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Said Hussein',
        email: 'designer@uoe-market.com',
        password: passwordHash,
        role: 'PROVIDER',
        studentId: 'DES001',
        bio: 'Professional graphic designer',
        title: 'Creative Designer'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Badeeengo Badee',
        email: 'developer@uoe-market.com',
        password: passwordHash,
        role: 'PROVIDER',
        studentId: 'DEV001',
        bio: 'Full-stack web developer',
        title: 'Software Engineer'
      }
    })
  ])

  // Seed Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        title: 'Mathematics Tutoring',
        description: 'One-on-one math tutoring for all levels',
        price: 25,
        priceType: 'per_hour',
        location: 'Online',
        status: 'ACTIVE',
        providerId: tutor.id,
        categoryId: (await prisma.category.findFirst({ where: { slug: 'tutoring' } }))!.id
      }
    }),
    prisma.service.create({
      data: {
        title: 'Logo Design',
        description: 'Professional logo design for your brand',
        price: 100,
        priceType: 'fixed',
        location: 'Online',
        status: 'ACTIVE',
        providerId: designer.id,
        categoryId: (await prisma.category.findFirst({ where: { slug: 'design' } }))!.id
      }
    }),
    prisma.service.create({
      data: {
        title: 'Website Development',
        description: 'Custom website development',
        price: 500,
        priceType: 'fixed',
        location: 'Online',
        status: 'ACTIVE',
        providerId: programmer.id,
        categoryId: (await prisma.category.findFirst({ where: { slug: 'programming' } }))!.id
      }
    })
  ])

  console.log('Database seeded successfully with all passwords set to "nassor"!')
  console.log('You can now login with any of these accounts:')
  console.table({
    Admin: admin.email,
    Tutor: tutor.email,
    Designer: designer.email,
    Programmer: programmer.email
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })