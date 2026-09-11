export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Offline</h1>
        <p className="mt-2 text-muted-foreground">
          You are currently offline. Please check your connection.
        </p>
      </div>
    </div>
  );
}
