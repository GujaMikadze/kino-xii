import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import MyTickets, { type TicketList } from "../features/profile/MyTickets";
import ProfileForm from "../features/profile/ProfileForm";
import { useTickets } from "../hooks/useTickets";

type Tab = "personal" | "tickets";

export default function ProfilePage() {
  const { user, isBooting, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const tab: Tab = params.get("tab") === "tickets" ? "tickets" : "personal";
  const list: TicketList = params.get("list") === "past" ? "past" : "upcoming";

  const tickets = useTickets(!!user);
  const upcomingCount = tickets.data?.filter((o) => o.isUpcoming).length ?? 0;

  // არაავტორიზებულს login მოდალი უნდა გაეხსნას (logout-ზე კი არა)
  const hadUser = useRef(false);
  const asked = useRef(false);
  if (user) hadUser.current = true;

  useEffect(() => {
    if (isBooting || user || hadUser.current || asked.current) return;
    asked.current = true;
    openAuthModal("login").then((ok) => {
      if (!ok) navigate("/");
    });
  }, [isBooting, user, openAuthModal, navigate]);

  const update = (changes: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(changes)) {
          if (v === null) next.delete(k);
          else next.set(k, v);
        }
        return next;
      },
      { replace: true },
    );

  const changeTab = (t: Tab) =>
    update({ tab: t === "tickets" ? "tickets" : null, list: null });

  if (isBooting) {
    return (
      <div className="max-w-220 space-y-5 pt-4" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState title="Log in to view your profile" text="Your details and tickets live here.">
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="h-10 rounded-full bg-accent px-6 text-xs font-bold hover:bg-accent-hover"
        >
          Log in
        </button>
      </EmptyState>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "personal", label: "Personal Information" },
    { id: "tickets", label: "My Tickets" },
  ];

  return (
    <div className="pt-4">
      <h1 className="mb-7 text-2xl font-extrabold">My Profile</h1>

      <div role="tablist" className="mb-8 flex gap-8 border-b border-[#1E2031]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => changeTab(t.id)}
            className={`relative flex items-center gap-2 pb-3.5 px-0.5 text-sm font-semibold ${
              tab === t.id ? "text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {t.label}
            {t.id === "tickets" && upcomingCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold">
                {upcomingCount}
              </span>
            )}
            {tab === t.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {tab === "personal" ? (
        <ProfileForm user={user} />
      ) : (
        <MyTickets
          list={list}
          onListChange={(l) => update({ list: l === "past" ? "past" : null })}
        />
      )}
    </div>
  );
}