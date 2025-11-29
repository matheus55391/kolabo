import { UserMenu } from "./user-menu";

type AuthHeaderProps = {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
};

export function AuthHeader({ user }: AuthHeaderProps) {
    return (
        <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xl">K</span>
                    </div>
                    <span className="font-bold text-xl">Kolabo</span>
                </div>

                <div className="flex items-center gap-4">
                    <UserMenu user={user} />
                </div>
            </div>
        </header>
    );
}
