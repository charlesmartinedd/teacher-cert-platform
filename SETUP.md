# TeachCertPro - Production Setup Guide

Welcome to the enhanced TeachCertPro platform! This guide will walk you through setting up all the production-ready features.

## 🚀 What's New

Your platform now includes:

- ✅ **Real Authentication** (NextAuth.js with Google OAuth + Email)
- ✅ **Database Integration** (Supabase for data persistence)
- ✅ **Interactive Quizzes** (Real-time scoring & feedback)
- ✅ **Progress Tracking** (Lesson completion & analytics)
- ✅ **Payment System** (Stripe subscriptions)
- ✅ **Certificate Generation** (PDF certificates on completion)
- ✅ **Global State Management** (Zustand stores)
- ✅ **Toast Notifications** (React Hot Toast)

---

## 📋 Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A Supabase account (free tier is fine)
- A Stripe account (test mode is fine for development)
- A Google Cloud project (for OAuth - optional but recommended)

---

## 🔧 Step 1: Environment Setup

### 1.1 Copy the environment template

```bash
cp .env.example .env.local
```

### 1.2 Configure your environment variables

Open `.env.local` and fill in the following sections:

---

## 🗄️ Step 2: Supabase Database Setup

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: teachcertpro (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 2.2 Get your Supabase credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2.3 Run the database schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from your project root
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

This creates all necessary tables:
- users
- enrollments
- lesson_progress
- quiz_attempts
- quiz_answers
- bookmarks
- achievements
- certificates
- study_streaks
- payment_history

---

## 🔐 Step 3: NextAuth Setup

### 3.1 Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to your `.env.local`:

```env
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3.2 Configure Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure consent screen if prompted
6. Choose **Web application**
7. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
8. Copy your credentials to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> **Note**: Users can still sign in with email/password even without Google OAuth configured.

---

## 💳 Step 4: Stripe Setup

### 4.1 Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up or sign in
3. You'll start in **Test Mode** (perfect for development)

### 4.2 Get your API keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy to `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 4.3 Create Products and Prices

1. In Stripe Dashboard, go to **Products** → **Add product**

**Create Product 1: Basic Plan**
- Name: `TeachCertPro Basic`
- Description: `Access to single exam preparation course`
- Pricing: `$99/month` or one-time
- Copy the Price ID (starts with `price_...`)

**Create Product 2: Pro Plan**
- Name: `TeachCertPro Pro`
- Description: `Access to 3 exam courses`
- Pricing: `$149/month`
- Copy the Price ID

**Create Product 3: Premium Plan**
- Name: `TeachCertPro Premium`
- Description: `Unlimited access to all courses`
- Pricing: `$249/month`
- Copy the Price ID

Add price IDs to `.env.local`:

```env
STRIPE_PRICE_BASIC_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx
```

### 4.4 Set up Webhook (for production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

> **Note**: For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks.

---

## 📧 Step 5: Email Setup (Optional)

For sending transactional emails (welcome, password reset, etc.):

### Option A: Resend (Recommended)

1. Go to [https://resend.com](https://resend.com)
2. Sign up and get API key
3. Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Option B: SendGrid

1. Go to [https://sendgrid.com](https://sendgrid.com)
2. Get API key
3. Configure in your app

---

## 🏃 Step 6: Run the Application

### Install dependencies (if not already done)

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ Step 7: Test Everything

### 7.1 Test Authentication

1. Go to `/login`
2. Enter any email (e.g., `test@example.com`) and password
3. You should be signed in and redirected to account page
4. You should see your name in the header
5. Try signing out

### 7.2 Test Course Enrollment

1. Sign in
2. Browse to a course (e.g., CSET Multiple Subjects)
3. Click a module to view lessons
4. Mark a lesson as complete
5. Check that it persists (refresh the page)

### 7.3 Test Quiz System

1. Navigate to a module with a quiz
2. Take the quiz
3. Submit and view results
4. Results should be saved to database

### 7.4 Test Payment (in Stripe Test Mode)

1. Go to `/pricing`
2. Click "Get Started" on a plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future expiry date, any CVC
5. Complete checkout
6. Check webhook received in Stripe Dashboard

---

## 🚀 Step 8: Deploy to Production

### Recommended: Vercel

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy!

### Important for Production:

1. **Update NEXTAUTH_URL**:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Update Google OAuth Redirect URIs** in Google Cloud Console

3. **Update Stripe Webhook Endpoint** to production URL

4. **Switch Stripe to Live Mode**:
   - Use live API keys (pk_live_..., sk_live_...)
   - Use live price IDs

5. **Configure Custom Domain** in Vercel

---

## 📊 Database Schema Overview

Your Supabase database now has these tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with subscription info |
| `enrollments` | Course enrollments with progress % |
| `lesson_progress` | Individual lesson completion tracking |
| `quiz_attempts` | Quiz results and scores |
| `quiz_answers` | Detailed answer tracking for review |
| `bookmarks` | Saved lessons for quick access |
| `achievements` | Earned badges and milestones |
| `certificates` | Generated completion certificates |
| `study_streaks` | Daily study activity tracking |
| `payment_history` | Stripe payment records |

All tables have Row Level Security (RLS) enabled so users can only access their own data.

---

## 🎯 Key Features Guide

### Using the Interactive Quiz System

```tsx
import InteractiveQuiz from '@/components/quiz/InteractiveQuiz';

<InteractiveQuiz
  questions={moduleData.quiz.questions}
  moduleId="module-1"
  courseId="cset-multiple-subjects"
  quizTitle="Module 1 Quiz"
  passingScore={70}
/>
```

### Tracking Lesson Progress

```tsx
import LessonCompleteButton from '@/components/progress/LessonCompleteButton';

<LessonCompleteButton
  courseId="cset-multiple-subjects"
  moduleId="module-1"
  lessonId="lesson-1-1"
  onComplete={() => console.log('Lesson completed!')}
/>
```

### Generating Certificates

```tsx
import { downloadCertificate } from '@/lib/certificate';

const handleDownload = () => {
  downloadCertificate({
    userName: 'John Doe',
    courseName: 'CSET Multiple Subjects',
    completionDate: new Date(),
    certificateNumber: 'CERT-2025-001234',
  });
};
```

### Using Zustand Stores

```tsx
import { useUserStore, useEnrollmentStore } from '@/lib/store';

function MyComponent() {
  const { userId, subscriptionTier } = useUserStore();
  const { enrollments, setEnrollments } = useEnrollmentStore();

  // Access and update global state
}
```

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use environment variables** for all secrets
3. **Enable RLS** on all Supabase tables (already done in schema)
4. **Validate user input** on all API routes
5. **Use HTTPS** in production
6. **Keep dependencies updated**: `npm audit` regularly

---

## 🐛 Troubleshooting

### "Unauthorized" errors

- Check that you're signed in
- Verify your session with: `const session = useSession()`
- Check browser console for errors

### Database errors

- Verify Supabase credentials in `.env.local`
- Check RLS policies allow the operation
- View logs in Supabase Dashboard → Logs

### Stripe webhook not working

- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check webhook signing secret matches
- View webhook logs in Stripe Dashboard

### Google OAuth not working

- Verify redirect URI matches exactly (including http vs https)
- Check OAuth consent screen is configured
- Make sure Google+ API is enabled

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

---

## 🎉 You're All Set!

Your TeachCertPro platform is now production-ready with:

- ✅ Secure authentication
- ✅ Database persistence
- ✅ Interactive learning features
- ✅ Payment processing
- ✅ Progress tracking
- ✅ Certificate generation

## Next Steps

1. **Customize branding** - Update colors, logos, and copy
2. **Add more content** - Create additional modules and quizzes
3. **Set up analytics** - Add Google Analytics or Plausible
4. **Configure monitoring** - Use Sentry for error tracking
5. **Create marketing pages** - Add landing pages, blog, etc.
6. **Enable email notifications** - Welcome emails, reminders, etc.

Need help? Check the code comments or reach out to your development team!

---

**Built with ❤️ for educators everywhere.**
