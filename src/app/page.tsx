import {ThemeSelect} from '@/components/shared/theme-select';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Layers3,
  ListTodo,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const collaborationImage =
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2400&q=85';

const projectRows = [
  {name: 'Product launch', status: 'In progress', color: 'bg-[#8ab66e]'},
  {name: 'Customer onboarding', status: 'Planning', color: 'bg-[#d9b85f]'},
  {name: 'Platform refresh', status: 'On track', color: 'bg-[#8ab66e]'},
];

export default function Home() {
  return (
    <div className='min-h-screen bg-[#f2f4ef] text-[#1b2d27] dark:bg-[#111a16] dark:text-[#e5ece7]'>
      <header className='sticky top-0 z-40 border-b border-[#d5ddd6] bg-[#f2f4ef]/95 backdrop-blur dark:border-[#3a4a40] dark:bg-[#111a16]/95'>
        <div className='mx-auto flex min-h-18 max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3 sm:px-8'>
          <Link
            aria-label='TeamFlow home'
            className='inline-flex items-center gap-3'
            href='/'
          >
            <span className='grid size-10 place-items-center rounded-md bg-[#d9f16a] text-[#193c35]'>
              <Layers3 aria-hidden='true' size={21} strokeWidth={2.2} />
            </span>
            <span className='text-lg font-semibold'>TeamFlow</span>
          </Link>

          <nav
            aria-label='Main navigation'
            className='order-3 flex w-full gap-5 overflow-x-auto text-sm text-[#53665d] md:order-2 md:ml-auto md:w-auto dark:text-[#aab9af]'
          >
            <Link
              className='shrink-0 hover:text-[#193c35] dark:hover:text-white'
              href='#workspace'
            >
              Workspace
            </Link>
            <Link
              className='shrink-0 hover:text-[#193c35] dark:hover:text-white'
              href='#workflow'
            >
              How it works
            </Link>
            <Link
              className='shrink-0 hover:text-[#193c35] dark:hover:text-white'
              href='#teams'
            >
              For teams
            </Link>
          </nav>

          <div className='ml-auto flex items-center gap-3 md:order-3'>
            <ThemeSelect />
            <Link
              className='hidden h-10 items-center px-2 text-sm font-semibold text-[#245448] hover:text-[#193c35] sm:inline-flex dark:text-[#b8d3c0] dark:hover:text-white'
              href='/login'
            >
              Sign in
            </Link>
            <Link
              className='inline-flex h-10 items-center gap-2 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white transition hover:bg-[#245448] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35]'
              href='/register'
            >
              Get started <ArrowRight aria-hidden='true' size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section
          aria-labelledby='hero-title'
          className='relative isolate flex min-h-[74svh] items-end overflow-hidden bg-[#193c35] text-white'
        >
          <Image
            alt='A product team working together around a table'
            className='object-cover object-center'
            fill
            priority
            quality={85}
            sizes='100vw'
            src={collaborationImage}
          />
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-[#102f28]/45'
          />
          <div className='relative z-10 mx-auto w-full max-w-7xl px-5 pb-11 pt-24 sm:px-8 sm:pb-16 sm:pt-28 lg:pb-20'>
            <p className='text-xs font-semibold uppercase text-[#e0f289]'>
              Organization workspace
            </p>
            <h1
              className='mt-4 max-w-3xl text-5xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl'
              id='hero-title'
            >
              TeamFlow
            </h1>
            <p className='mt-5 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl'>
              Bring people, projects, and next steps into one clear place to
              move work forward together.
            </p>
            <div className='mt-8 flex flex-wrap items-center gap-4'>
              <Link
                className='inline-flex h-12 items-center gap-2 rounded-md bg-[#d9f16a] px-5 text-sm font-semibold text-[#193c35] transition hover:bg-[#e6f79d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                href='/register'
              >
                Create your workspace{' '}
                <ArrowRight aria-hidden='true' size={17} />
              </Link>
              <Link
                className='inline-flex h-12 items-center gap-2 px-2 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                href='/login'
              >
                Sign in <ArrowUpRight aria-hidden='true' size={16} />
              </Link>
            </div>
            <div className='mt-12 grid max-w-3xl gap-4 border-t border-white/35 pt-5 text-sm text-white/90 sm:grid-cols-3 sm:gap-8'>
              <p className='flex items-center gap-2'>
                <Check
                  aria-hidden='true'
                  className='text-[#e0f289]'
                  size={16}
                />
                Projects with clear ownership
              </p>
              <p className='flex items-center gap-2'>
                <Check
                  aria-hidden='true'
                  className='text-[#e0f289]'
                  size={16}
                />
                Tasks your team can move
              </p>
              <p className='flex items-center gap-2'>
                <Check
                  aria-hidden='true'
                  className='text-[#e0f289]'
                  size={16}
                />
                Access shaped around roles
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby='workspace-title'
          className='border-b border-[#d5ddd6] bg-[#f2f4ef] py-16 sm:py-20 dark:border-[#3a4a40] dark:bg-[#111a16]'
          id='workspace'
        >
          <div className='mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-16'>
            <div>
              <p className='text-xs font-semibold uppercase text-[#587567] dark:text-[#a7c4ad]'>
                A steady view of the work
              </p>
              <h2
                className='mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl'
                id='workspace-title'
              >
                Keep the work visible, not buried in handoffs.
              </h2>
              <p className='mt-4 max-w-lg text-base leading-7 text-[#64756c] dark:text-[#aab9af]'>
                Projects hold the plan. Tasks make the next step clear. Teams
                and roles keep ownership understandable as your organization
                grows.
              </p>
              <Link
                className='mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#245448] underline decoration-[#91ad9d] underline-offset-4 hover:text-[#193c35] dark:text-[#b8d3c0] dark:hover:text-white'
                href='/register'
              >
                Start with your team <ArrowRight aria-hidden='true' size={16} />
              </Link>
            </div>

            <div
              aria-label='Sample TeamFlow workspace'
              className='min-w-0 border-y border-[#cbd4ce] bg-white dark:border-[#3a4a40] dark:bg-[#1d2a24]'
            >
              <div className='flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e9e4] px-5 py-4 dark:border-[#3a4a40]'>
                <div>
                  <p className='text-xs font-semibold uppercase text-[#64756c] dark:text-[#aab9af]'>
                    Sample workspace
                  </p>
                  <p className='mt-1 font-semibold'>Northstar Studio</p>
                </div>
                <span className='text-sm text-[#64756c] dark:text-[#aab9af]'>
                  This week
                </span>
              </div>
              <div className='grid grid-cols-2 divide-x divide-[#e4e9e4] border-b border-[#e4e9e4] dark:divide-[#3a4a40] dark:border-[#3a4a40] sm:grid-cols-3'>
                <div className='px-5 py-4'>
                  <p className='text-xs text-[#64756c] dark:text-[#aab9af]'>
                    Projects
                  </p>
                  <p className='mt-1 text-2xl font-semibold tabular-nums'>06</p>
                </div>
                <div className='px-5 py-4'>
                  <p className='text-xs text-[#64756c] dark:text-[#aab9af]'>
                    Open tasks
                  </p>
                  <p className='mt-1 text-2xl font-semibold tabular-nums'>18</p>
                </div>
                <div className='col-span-2 flex items-center gap-2 px-5 py-4 sm:col-span-1'>
                  <span
                    aria-hidden='true'
                    className='size-2 rounded-full bg-[#6a9b78]'
                  />
                  <span className='text-sm font-medium'>Work is moving</span>
                </div>
              </div>
              <div className='px-5 py-4'>
                <div className='grid grid-cols-[1.2fr_0.8fr] gap-4 pb-3 text-xs font-semibold uppercase text-[#74847d] sm:grid-cols-[1.2fr_0.7fr_0.8fr]'>
                  <span>Project</span>
                  <span>Status</span>
                  <span className='hidden sm:block'>Next checkpoint</span>
                </div>
                <ul className='divide-y divide-[#e4e9e4] dark:divide-[#3a4a40]'>
                  {projectRows.map((row) => (
                    <li
                      className='grid min-h-12 grid-cols-[1.2fr_0.8fr] items-center gap-4 text-sm sm:grid-cols-[1.2fr_0.7fr_0.8fr]'
                      key={row.name}
                    >
                      <span className='truncate font-medium'>{row.name}</span>
                      <span className='flex items-center gap-2 text-xs text-[#53665d] dark:text-[#aab9af]'>
                        <span
                          aria-hidden='true'
                          className={`size-2 rounded-full ${row.color}`}
                        />
                        {row.status}
                      </span>
                      <span className='hidden text-xs text-[#64756c] dark:text-[#aab9af] sm:block'>
                        Team check-in
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby='workflow-title'
          className='bg-[#e8ede7] py-16 sm:py-20 dark:bg-[#15211b]'
          id='workflow'
        >
          <div className='mx-auto max-w-7xl px-5 sm:px-8'>
            <div className='max-w-2xl'>
              <p className='text-xs font-semibold uppercase text-[#587567] dark:text-[#a7c4ad]'>
                A practical rhythm
              </p>
              <h2
                className='mt-3 text-3xl font-semibold leading-tight sm:text-4xl'
                id='workflow-title'
              >
                From shared goals to work in motion.
              </h2>
            </div>
            <div className='mt-10 grid gap-8 border-t border-[#cbd4ce] pt-7 sm:grid-cols-3 sm:gap-10 dark:border-[#3a4a40]'>
              <article>
                <Layers3
                  aria-hidden='true'
                  className='text-[#346e58] dark:text-[#a7c4ad]'
                  size={23}
                />
                <h3 className='mt-4 text-lg font-semibold'>Shape the work</h3>
                <p className='mt-2 text-sm leading-6 text-[#64756c] dark:text-[#aab9af]'>
                  Give projects a clear owner, status, priority, and checkpoint
                  so everyone starts from the same plan.
                </p>
              </article>
              <article>
                <ListTodo
                  aria-hidden='true'
                  className='text-[#346e58] dark:text-[#a7c4ad]'
                  size={23}
                />
                <h3 className='mt-4 text-lg font-semibold'>
                  Move the next step
                </h3>
                <p className='mt-2 text-sm leading-6 text-[#64756c] dark:text-[#aab9af]'>
                  Track tasks in a table or status board, assign ownership, and
                  keep changes visible in context.
                </p>
              </article>
              <article id='teams'>
                <UsersRound
                  aria-hidden='true'
                  className='text-[#346e58] dark:text-[#a7c4ad]'
                  size={23}
                />
                <h3 className='mt-4 text-lg font-semibold'>
                  Keep access clear
                </h3>
                <p className='mt-2 text-sm leading-6 text-[#64756c] dark:text-[#aab9af]'>
                  Organize teams, invite collaborators, and use roles to make
                  responsibility explicit.
                </p>
              </article>
            </div>
          </div>
        </section>

        <footer className='bg-[#193c35] text-white'>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-10 sm:px-8 sm:py-12'>
            <div>
              <p className='text-xs font-semibold uppercase text-[#d9f16a]'>
                Make the next step clear
              </p>
              <p className='mt-2 text-2xl font-semibold'>
                Bring your team into TeamFlow.
              </p>
            </div>
            <Link
              className='inline-flex h-11 items-center gap-2 rounded-md bg-[#d9f16a] px-4 text-sm font-semibold text-[#193c35] hover:bg-[#e6f79d]'
              href='/register'
            >
              Create a workspace <ArrowRight aria-hidden='true' size={16} />
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
