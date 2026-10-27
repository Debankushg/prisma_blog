import { getCurrentUser } from "@/lib/data/user";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Brand } from "./brand";
import { TourController } from "@/components/tour/tour-controller";
import { LogoutButton } from "./logout-button";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

const inner = "mx-auto flex h-16 max-w-4xl items-center justify-between gap-2 px-3 sm:px-4";

export async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="nav-glass">
      <div className={inner}>
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <Brand href="/explore" compactOnMobile />
          {user && <NavLinks />}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user && <UserMenu name={user.name} email={user.email} age={user.age} />}
          {/* The "?" replay button is hidden on phones to save room; the tour still auto-starts. */}
          {user && (
            <div className="hidden sm:block">
              <TourController userId={user.id} />
            </div>
          )}
          <ThemeToggle />
          {user && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}

export function NavbarSkeleton() {
  return (
    <header className="nav-glass">
      <div className={inner}>
        <Brand href="/blogs" />
        <ThemeToggle />
      </div>
    </header>
  );
}
