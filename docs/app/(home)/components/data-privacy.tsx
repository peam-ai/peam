export const DataPrivacy = () => (
  <section className="px-8 sm:px-12 py-12 sm:py-16">
    <div className="max-w-3xl mx-auto text-center space-y-4">
      <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight">Data Privacy First</h2>
      <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
        Your data stays yours. Peam processes content <b>locally</b> without sending it to third parties. Full control
        over your AI models and data.
      </p>
      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 border border-border">
          <svg
            className="size-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-sm font-medium">Local Processing</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 border border-border">
          <svg
            className="size-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="text-sm font-medium">No Data Tracking</span>
        </div>
      </div>
    </div>
  </section>
);
