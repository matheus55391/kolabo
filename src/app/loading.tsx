export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center animate-pulse">
                        <span className="text-primary-foreground font-bold text-3xl">K</span>
                    </div>
                    <div className="absolute inset-0 rounded-lg bg-primary/20 animate-ping" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
            </div>
        </div>
    );
}
