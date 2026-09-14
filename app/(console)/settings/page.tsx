import { TextToggle } from "@/components/console/TextToggle";

export const metadata = { title: "Settings — LoopWear Console" };

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <label className="block">
      <span className="font-ui text-xs uppercase tracking-wide text-brand-navy/50">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="mt-1.5 block w-full border-0 border-b border-brand-navy/20 bg-transparent py-1.5 font-ui text-sm text-brand-navy focus:border-brand-gold focus:outline-none"
      />
    </label>
  );
}

export default function SettingsPage() {
  return (
    <div className="max-w-xl space-y-14 px-4 py-8 md:px-10">
      <section>
        <h2 className="font-display text-lg font-medium text-brand-navy">Operator profile</h2>
        <div className="mt-5 space-y-5">
          <Field label="Name" defaultValue="Satya Prakash" />
          <Field label="Email" defaultValue="barbadi072@gmail.com" type="email" />
          <Field label="Home facility" defaultValue="Bengaluru Central" />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-medium text-brand-navy">Notification preferences</h2>
        <div className="mt-3">
          <TextToggle label="Overdue returns" description="Alert when a rental passes its return window." defaultOn />
          <TextToggle label="Laundry delays" description="Alert when a batch runs past its estimated time." defaultOn />
          <TextToggle label="Courier delays" description="Alert when a scheduled pickup or drop-off is running late." defaultOn />
          <TextToggle label="Daily summary" description="A single end-of-day digest instead of live alerts." />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-medium text-brand-navy">Platform preferences</h2>
        <div className="mt-3">
          <TextToggle label="Compact ledger tables" description="Reduce row height across Orders, Payments and Customers." />
          <TextToggle label="Announcement ticker" description="Show the scrolling status line in the header." defaultOn />
        </div>
      </section>
    </div>
  );
}
