import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { UserDTO } from '@/types/dto';
import { LinkButton } from '@/components/ui/link-button';
import { SearchInput } from '@/components/notes/search-input';
import { TopbarMobileSearch } from '@/components/notes/topbar-mobile-search';
import { MobileMenuButton } from './mobile-menu-button';
import { UserMenu } from './user-menu';

export function Topbar({ user }: { user: UserDTO }) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-line bg-surface-raised lg:h-16">
      <div className="flex h-full items-center gap-3 px-4 lg:px-8">
        <MobileMenuButton />
        <Link href="/notes" className="flex shrink-0 items-center gap-1.5 font-semibold text-ink">
          notas
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        </Link>
        <div className="hidden max-w-md flex-1 md:block">
          <SearchInput />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <TopbarMobileSearch />
          <LinkButton
            href="/notes/new"
            size="md"
            icon={<Plus aria-hidden="true" />}
            className="hidden sm:inline-flex"
          >
            Nueva nota
          </LinkButton>
          <LinkButton href="/notes/new" size="icon" className="sm:hidden" aria-label="Nueva nota">
            <Plus aria-hidden="true" />
          </LinkButton>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
