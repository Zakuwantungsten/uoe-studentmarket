// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

// Function to generate student ID with proper course prefix
function generateStudentId(sequence: number, coursePrefix: string): string {
  return `${coursePrefix}/${sequence.toString().padStart(3, '0')}/22`;
}

async function main() {
  // Hash password for all users
  const password = hashSync('nassor', 10);

  // Create categories first with more realistic counts
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Tutoring',
        description: 'Academic assistance and subject tutoring',
        icon: 'Book',
        slug: 'tutoring',
        count: 24, // Many students offer tutoring
      },
      {
        name: 'Food Delivery',
        description: 'Meal delivery services around campus',
        icon: 'Utensils',
        slug: 'food-delivery',
        count: 8, // Fewer food delivery options
      },
      {
        name: 'House Hunting',
        description: 'Assistance with finding accommodation',
        icon: 'Home',
        slug: 'house-hunting',
        count: 5, // Limited to few experts
      },
      {
        name: 'Laundry',
        description: 'Laundry and dry cleaning services',
        icon: 'Shirt',
        slug: 'laundry',
        count: 6, // Few laundry service providers
      },
      {
        name: 'Graphic Design',
        description: 'Design services for students',
        icon: 'Palette',
        slug: 'graphic-design',
        count: 4, // Few design students
      },
      {
        name: 'Event Planning',
        description: 'Help with organizing events',
        icon: 'Calendar',
        slug: 'event-planning',
        count: 3, // Very specialized
      },
      {
        name: 'Tech Support',
        description: 'Computer and tech assistance',
        icon: 'Laptop',
        slug: 'tech-support',
        count: 7, // Several tech-savvy students
      },
      {
        name: 'Transportation',
        description: 'Ride services around campus',
        icon: 'Car',
        slug: 'transportation',
        count: 5, // Few students with cars
      },
      {
        name: 'Photography',
        description: 'Photography services for students',
        icon: 'Camera',
        slug: 'photography',
        count: 3, // Specialized skill
      },
      {
        name: 'Music Lessons',
        description: 'Music instruction and tutoring',
        icon: 'Music',
        slug: 'music-lessons',
        count: 2, // Very few
      },
      {
        name: 'Haircuts',
        description: 'Hair styling services',
        icon: 'Scissors',
        slug: 'haircuts',
        count: 3, // Few students offering
      },
      {
        name: 'Shopping Assistant',
        description: 'Help with shopping and errands',
        icon: 'ShoppingBag',
        slug: 'shopping-assistant',
        count: 2, // Very few
      },
    ],
    
  });

  console.log(`Created ${categories.count} categories`);

  // Create providers (users with provider role)
  const provider1 = await prisma.user.create({
    data: {
      name: 'Nassor Hamdu',
      email: 'nassor.hamdu@student.com',
      password,
      title: 'Computer Science Student',
      role: 'PROVIDER',
      studentId: generateStudentId(1, 'CS'), // CS for Computer Science
      bio: 'Experienced tutor and web developer helping fellow students succeed.',
      skills: {
        create: [
          { skill: 'Programming' },
          { skill: 'Web Development' },
          { skill: 'Java' },
          { skill: 'Python' },
          { skill: 'JavaScript' },
        ],
      },
      education: {
        create: [
          {
            institution: 'University of Nairobi',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2020-09-01'),
            current: true,
          },
        ],
      },
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      name: 'Najma Mohameed',
      email: 'najma.mohameed@student.com',
      password,
      title: 'Business Administration Student',
      role: 'PROVIDER',
      studentId: generateStudentId(2, 'BA'), // BA for Business Administration
      bio: 'Reliable food delivery service to help busy students eat well.',
      skills: {
        create: [
          { skill: 'Food Delivery' },
          { skill: 'Customer Service' },
          { skill: 'Time Management' },
        ],
      },
      education: {
        create: [
          {
            institution: 'Kenyatta University',
            degree: 'Bachelor of Commerce',
            fieldOfStudy: 'Business Administration',
            startDate: new Date('2021-01-10'),
            current: true,
          },
        ],
      },
    },
  });

  const provider3 = await prisma.user.create({
    data: {
      name: 'Albert James',
      email: 'albert.james@student.com',
      password,
      title: 'Engineering Student',
      role: 'PROVIDER',
      studentId: generateStudentId(3, 'ENG'), // ENG for Engineering
      bio: 'Offering laundry services to help students save time.',
      skills: {
        create: [
          { skill: 'Laundry' },
          { skill: 'Organization' },
          { skill: 'Attention to Detail' },
        ],
      },
      education: {
        create: [
          {
            institution: 'Jomo Kenyatta University',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Mechanical Engineering',
            startDate: new Date('2019-09-01'),
            current: true,
          },
        ],
      },
    },
  });

  const provider4 = await prisma.user.create({
    data: {
      name: 'Zac Migro',
      email: 'zac.migro@student.com',
      password,
      title: 'Education Student',
      role: 'PROVIDER',
      studentId: generateStudentId(4, 'EDU'), // EDU for Education
      bio: 'Patient tutor helping students understand complex concepts.',
      skills: {
        create: [
          { skill: 'Tutoring' },
          { skill: 'Mathematics' },
          { skill: 'Science' },
          { skill: 'Teaching' },
        ],
      },
      education: {
        create: [
          {
            institution: 'Moi University',
            degree: 'Bachelor of Education',
            fieldOfStudy: 'Mathematics and Physics',
            startDate: new Date('2020-05-01'),
            current: true,
          },
        ],
      },
    },
  });

  console.log('Created 4 provider users');

  // [Rest of your seed file remains the same...]
  // Continue with services, customers, bookings, reviews, etc.

  // Create some regular users (customers)
  const customer1 = await prisma.user.create({
    data: {
      name: 'Nassor Hamdu',
      email: 'nassor.hamdu.customer@student.com',
      password,
      role: 'USER',
      studentId: generateStudentId(5, 'CS'), // Same course as provider1
      bio: 'Computer science student looking for tutoring services.',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Najma Mohameed',
      email: 'najma.mohameed.customer@student.com',
      password,
      role: 'USER',
      studentId: generateStudentId(6, 'BA'), // Same course as provider2
      bio: 'Business student in need of various campus services.',
    },
  });

  console.log('Created 2 customer users');

  // [Rest of your existing seed code...]
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });