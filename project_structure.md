# Project Structure and Tech Stack

## Tech Stack
- **Framework**: Next.js (v15.1.0)
- **UI Library**: React (v19)
- **Styling**: Tailwind CSS
- **State Management**: React Hook Form, Zod
- **Database**: Prisma, Mongoose
- **Authentication**: NextAuth
- **Utilities**: Axios, dotenv, Morgan

## Project Structure
```
my-v0-project/
├── app/
│   ├── about/
│   ├── admin/
│   ├── api/
│   ├── bookings/
│   ├── categories/
│   ├── community/
│   ├── contact/
│   ├── dashboard/
│   ├── faq/
│   ├── login/
│   ├── messages/
│   ├── my-services/
│   ├── offer-service/
│   ├── privacy/
│   ├── profile/
│   ├── provider-dashboard/
│   ├── search/
│   ├── services/
│   ├── settings/
│   ├── signup/
│   ├── terms/
│   └── page.tsx
├── components/
│   ├── admin-dashboard.tsx
│   ├── booking-calendar.tsx
│   ├── chat-interface.tsx
│   ├── footer.tsx
│   ├── header.tsx
│   ├── theme-provider.tsx
│   └── ui/
├── controllers/
├── hooks/
├── lib/
├── middleware/
├── models/
├── prisma/
├── public/
├── routes/
├── styles/
├── .gitignore
├── components.json
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
└── tsconfig.json
