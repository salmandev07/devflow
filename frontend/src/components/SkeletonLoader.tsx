function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ── Dashboard ──

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonBlock className="h-8 w-16 mt-1" />
      <SkeletonBlock className="h-3 w-32" />
    </div>
  );
}

export function SkeletonStatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 flex flex-col gap-4">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

export function SkeletonChartsRow() {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <SkeletonChart />
      <SkeletonChart />
    </div>
  );
}

export function SkeletonDeadlines() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 flex flex-col gap-4">
      <SkeletonBlock className="h-4 w-36" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-5 w-14 rounded-full" />
            <SkeletonBlock className="h-4 w-40" />
          </div>
          <SkeletonBlock className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonActivityFeed() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 flex flex-col gap-4">
      <SkeletonBlock className="h-4 w-28" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <SkeletonBlock className="h-7 w-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRecentTasks() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
      <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <SkeletonBlock className="h-5 w-14 rounded-full" />
            <SkeletonBlock className="h-5 w-14 rounded-full" />
            <SkeletonBlock className="h-3 w-20 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-56" />
          <SkeletonBlock className="h-3 w-72" />
        </div>
        <SkeletonBlock className="h-9 w-28 rounded-lg hidden sm:block" />
      </div>
      <SkeletonStatsGrid />
      <SkeletonStatsGrid />
      <SkeletonChartsRow />
      <div className="grid lg:grid-cols-2 gap-4">
        <SkeletonDeadlines />
        <SkeletonActivityFeed />
      </div>
      <SkeletonRecentTasks />
    </div>
  );
}

// ── Kanban ──

export function SkeletonKanbanCard() {
  return (
    <div className="mb-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-4 rounded" />
      </div>
      <SkeletonBlock className="h-3 w-full" />
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-14 rounded-full" />
        <SkeletonBlock className="h-6 w-6 rounded-full" />
      </div>
      <SkeletonBlock className="h-3 w-24" />
      <div className="flex items-center gap-1 pt-1">
        <SkeletonBlock className="h-3 w-3" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
    </div>
  );
}

export function SkeletonKanbanColumn() {
  return (
    <div className="min-h-[550px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-2 w-2 rounded-full" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
        <SkeletonBlock className="h-6 w-8 rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => <SkeletonKanbanCard key={i} />)}
      <div className="mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 py-12">
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
  );
}

export function SkeletonKanbanBoard() {
  return (
    <div className="page-enter space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonKanbanColumn />
        <SkeletonKanbanColumn />
        <SkeletonKanbanColumn />
      </div>
    </div>
  );
}

// ── Project Details ──

export function SkeletonProjectDetails() {
  return (
    <div className="page-enter space-y-6">
      <SkeletonBlock className="h-4 w-28" />
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
            <SkeletonBlock className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-10" />
        </div>
        <SkeletonBlock className="h-2 w-full rounded-full" />
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-28" />
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-3 w-20 inline-block mx-4 my-3" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <SkeletonBlock className="h-4 w-48" />
              <SkeletonBlock className="h-5 w-16 rounded-full" />
              <SkeletonBlock className="h-5 w-16 rounded-full" />
              <SkeletonBlock className="h-4 w-4 ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-16" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4 flex items-center gap-3">
              <SkeletonBlock className="h-9 w-9 rounded-lg" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Task Details ──

export function SkeletonTimerSection() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-6 w-28 rounded-full" />
      </div>
      <div className="flex gap-2">
        <SkeletonBlock className="h-9 w-20 rounded-lg" />
        <SkeletonBlock className="h-9 w-20 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/30 p-3 text-center space-y-1">
            <SkeletonBlock className="h-6 w-12 mx-auto" />
            <SkeletonBlock className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonSessionList() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
        <SkeletonBlock className="h-4 w-28" />
      </div>
      <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <div className="space-y-1">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-48" />
            </div>
            <SkeletonBlock className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetailsSection() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 space-y-4">
      <SkeletonBlock className="h-4 w-16" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBlock className="h-4 w-4" />
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTaskDetail() {
  return (
    <div className="page-enter space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-5 w-64" />
        <SkeletonBlock className="h-3 w-96" />
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <SkeletonTimerSection />
          <SkeletonSessionList />
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBlock className="h-5 w-5 rounded" />
                <SkeletonBlock className="h-4 flex-1" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 space-y-4">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-20 w-full rounded-lg" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <SkeletonBlock className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 space-y-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-24 w-full rounded-lg" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <SkeletonBlock className="h-4 w-40" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <SkeletonDetailsSection />
        </div>
      </div>
    </div>
  );
}

// ── Team Workspace ──

export function SkeletonTeamWorkspace() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4 space-y-2">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
              <SkeletonBlock className="h-4 w-32" />
              <div className="flex gap-2">
                <SkeletonBlock className="h-8 w-20 rounded-lg" />
                <SkeletonBlock className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <SkeletonBlock className="h-10 w-40 rounded-lg" />
        <SkeletonBlock className="h-10 w-32 rounded-lg" />
        <SkeletonBlock className="h-10 w-28 rounded-lg" />
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-24" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4 space-y-2">
              <SkeletonBlock className="h-4 w-48" />
              <SkeletonBlock className="h-3 w-full" />
              <div className="flex gap-4">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Reports ──

export function SkeletonReportControls() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-5 py-4">
      <SkeletonBlock className="h-10 w-48 rounded-lg" />
      <SkeletonBlock className="h-10 w-28 rounded-lg" />
      <SkeletonBlock className="h-6 w-px hidden sm:block" />
      <SkeletonBlock className="h-10 w-16 rounded-lg" />
      <SkeletonBlock className="h-10 w-16 rounded-lg" />
    </div>
  );
}

export function SkeletonReportResult() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
          <SkeletonBlock className="h-8 w-16" />
        </div>
        <SkeletonBlock className="h-2 w-full rounded-full" />
        <SkeletonBlock className="h-3 w-32" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
            </div>
            <SkeletonBlock className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notifications ──

export function SkeletonNotificationItem() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40 p-4">
      <SkeletonBlock className="h-2 w-2 rounded-full mt-1.5 shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-full" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-16 rounded-lg" />
          <SkeletonBlock className="h-6 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonNotificationList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => <SkeletonNotificationItem key={i} />)}
    </div>
  );
}

// ── Generic / Reusable ──

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 flex flex-col gap-3">
      <SkeletonBlock className="h-5 w-3/4" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-2/3" />
      <div className="flex gap-2 mt-2">
        <SkeletonBlock className="h-6 w-16 rounded-full" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-800/50">
      <SkeletonBlock className="h-4 w-48" />
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-6 w-16 rounded-full" />
      <SkeletonBlock className="h-6 w-16 rounded-full" />
      <SkeletonBlock className="h-4 w-20 ml-auto" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => <SkeletonTableRow key={i} />)}
    </div>
  );
}
