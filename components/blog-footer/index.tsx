export default function BlogFooter() {
  return (
    <footer className="mt-8 text-center text-xs leading-6 text-muted-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div aria-hidden="true" className="flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] tracking-[0.2em]">END</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <p className="py-8 sm:py-10">© {new Date().getFullYear()} By Lee</p>
      </div>
    </footer>
  )
}
