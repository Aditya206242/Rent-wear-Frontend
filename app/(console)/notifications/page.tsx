import { ManifestList, type ManifestItem } from "@/components/console/ManifestList";
import { listConsoleNotifications } from "@/lib/console/api";

export const metadata = { title: "Notifications — LoopWear Console" };

export default async function NotificationsPage() {
  const { items: notifications } = await listConsoleNotifications();

  const groups = notifications.reduce<Record<string, ManifestItem[]>>((acc, n) => {
    const day = new Date(n.timestamp).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    acc[day] ??= [];
    acc[day].push({
      id: n.id,
      severity: n.severity,
      title: n.title,
      detail: n.detail,
      meta: new Date(n.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    });
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(groups).map(([day, items]) => (
        <section key={day} className="border-b border-brand-navy/10">
          <h2 className="px-4 pt-6 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10">
            {day}
          </h2>
          <div className="mt-3">
            <ManifestList items={items} emptyLabel="No announcements." />
          </div>
        </section>
      ))}
    </div>
  );
}
