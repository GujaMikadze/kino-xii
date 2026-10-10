import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../../api/client";
import type {
  ApiResponse,
  FilterOptions,
  Order,
  Seat,
  SeatHold,
  Session,
  TicketTypeSlug,
  User,
} from "../../api/types";
import ErrorState from "../../components/ErrorState";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";
import { useCountdown } from "../../hooks/useCountdown";
import { useSeatMap } from "../../hooks/useSeatMap";
import { ticketPrice } from "../../lib/money";
import CheckoutStep, { type CheckoutValues } from "./CheckoutStep";
import Confirmation from "./Confirmation";
import HallMap from "./HallMap";
import HoldTimer from "./HoldTimer";
import SeatsPanel from "./SeatsPanel";
import StepTabs from "./StepTabs";
import { sessionSubtitle } from "./utils";

type Step = "seats" | "checkout" | "done";
type Selected = { seatId: number; ticketType: TicketTypeSlug };

const digits = (v: string) => v.replace(/\s/g, "");

// 422-ის პირველი ტექსტი (message ან errors-ის პირველი ველი)
function errorText(e: unknown) {
  if (!(e instanceof ApiError)) return "Network error. Please try again.";
  const first = e.errors ? Object.values(e.errors)[0]?.[0] : undefined;
  return first ?? e.message;
}

type Props = {
  session: Session;
  options: FilterOptions;
  user: User;
  onClose: () => void;
};

export default function BookingModal({ session, options, user, onClose }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const seatMap = useSeatMap(session.id);
  const { refetch: refetchMap } = seatMap;
  const { movie } = session;
  const max = options.maxSeatsPerOrder;

  const [step, setStep] = useState<Step>("seats");
  const [selected, setSelected] = useState<Selected[]>([]);
  const [hold, setHold] = useState<SeatHold | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [lost, setLost] = useState<Set<string>>(() => new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);
  const [paying, setPaying] = useState(false);
  const initialised = useRef(false);

  const seatsById = useMemo(() => {
    const m = new Map<number, Seat>();
    seatMap.data?.sections.forEach((sec) =>
      sec.rows.forEach((row) => row.seats.forEach((s) => m.set(s.id, s))),
    );
    return m;
  }, [seatMap.data]);

  const codeOf = (seatId: number) => seatsById.get(seatId)?.code ?? "?";

  // უკვე ჩემი hold-ის ადგილები (isMine) არჩეულად ბრუნდება, მხოლოდ პირველ ჩატვირთვაზე
  useEffect(() => {
    if (initialised.current || !seatMap.data) return;
    initialised.current = true;
    const mine = [...seatsById.values()].filter((s) => s.isMine).slice(0, max);
    if (mine.length) {
      setSelected(mine.map((s) => ({ seatId: s.id, ticketType: "adult" as const })));
    }
  }, [seatMap.data, seatsById, max]);

  // ფასები: სეანსის ფასი × ratio (/filter-options-იდან)
  const priceOf = (slug: TicketTypeSlug) =>
    ticketPrice(
      session.price,
      options.ticketTypes.find((t) => t.slug === slug)?.priceRatio ?? 1,
    );
  const subtotal =
    Math.round(selected.reduce((sum, s) => sum + priceOf(s.ticketType), 0) * 100) / 100;

  // ბილეთის ტიპები, რომლებიც ამ ფილმზე დასაშვებია (Child იმალება 16+/18+-ზე)
  const allowedTypes = useMemo(
    () =>
      options.ticketTypes
        .filter(
          (t) =>
            t.blockedFromRatingAge === null || movie.ageRating.minAge < t.blockedFromRatingAge,
        )
        .sort((a, b) => a.priceRatio - b.priceRatio),
    [options.ticketTypes, movie.ageRating.minAge],
  );

  // წესების დარღვევა: კონკრეტული ადგილი და მიზეზი, გაგრძელება დაბლოკილია
  const violations = useMemo(() => {
    const out: string[] = [];
    if (selected.length > max) out.push(`You can select up to ${max} seats per order.`);
    for (const s of selected) {
      const t = options.ticketTypes.find((x) => x.slug === s.ticketType);
      if (
        t &&
        t.blockedFromRatingAge !== null &&
        movie.ageRating.minAge >= t.blockedFromRatingAge
      ) {
        out.push(
          `${seatsById.get(s.seatId)?.code ?? "Seat"}: ${t.name} tickets aren't available for ${movie.ageRating.code} films.`,
        );
      }
    }
    return out;
  }, [selected, max, options.ticketTypes, movie.ageRating, seatsById]);

  const toggleSeat = (seat: Seat) => {
    setNotice(null);
    const isSelected = selected.some((s) => s.seatId === seat.id);

    if (isSelected) {
      setLimitMsg(null);
      setSelected(selected.filter((s) => s.seatId !== seat.id));
      return;
    }
    if (selected.length >= max) {
      setLimitMsg(`You can select up to ${max} seats per order.`);
      return;
    }
    setLimitMsg(null);
    setSelected([...selected, { seatId: seat.id, ticketType: "adult" }]);
  };

  const removeSeat = (seatId: number) => {
    setLimitMsg(null);
    setSelected((prev) => prev.filter((s) => s.seatId !== seatId));
  };

  const setTicketType = (seatId: number, slug: TicketTypeSlug) =>
    setSelected((prev) => prev.map((s) => (s.seatId === seatId ? { ...s, ticketType: slug } : s)));

  // 409: სხვამ დაასწრო. დაკარგული ადგილები sold-ად ვნიშნავთ, დანარჩენს ვინახავთ
  const reconcile = (contested: string[]) => {
    const lostCodes = new Set(contested);
    const remaining = selected.filter((s) => !lostCodes.has(codeOf(s.seatId)));

    setLost((prev) => new Set([...prev, ...contested]));
    setSelected(remaining);
    setHold(null);
    setStep("seats");
    setNotice(
      `${contested.length === 1 ? "Seat" : "Seats"} ${contested.join(", ")} ${
        contested.length === 1 ? "was" : "were"
      } just taken by someone else.${remaining.length ? " The rest of your selection was kept." : ""}`,
    );
    void refetchMap();
  };

  const goToCheckout = async () => {
    if (holding || selected.length === 0 || violations.length > 0) return;
    setHolding(true);
    setNotice(null);
    try {
      const res = await api<ApiResponse<SeatHold>>(`/sessions/${session.id}/holds`, {
        method: "POST",
        body: { seats: selected },
      });
      setHold(res.data);
      setStep("checkout");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.contested?.length) {
        reconcile(e.contested);
      } else {
        setNotice(errorText(e));
      }
    } finally {
      setHolding(false);
    }
  };

  // ვადის გასვლა: ადგილები თავისუფლდება, არჩევანი ირეცხება, Step 1 + ახალი რუკა
  const handleExpired = useCallback(() => {
    setHold(null);
    setSelected([]);
    setStep("seats");
    setNotice("Your hold time expired. Please re-select your seats.");
    void refetchMap();
  }, [refetchMap]);

  const secondsLeft = useCountdown(hold?.expiresAt ?? null, handleExpired);

  const refreshLists = () => {
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
    queryClient.invalidateQueries({ queryKey: ["movie-sessions"] });
  };

  const pay = async (values: CheckoutValues) => {
    if (!hold || paying) return;
    setPaying(true);
    try {
      const res = await api<ApiResponse<Order>>("/orders", {
        method: "POST",
        body: {
          holdId: hold.holdId,
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          mobileNumber: digits(values.mobileNumber),
          cardNumber: digits(values.cardNumber),
          expiry: values.expiry,
          cvv: values.cvv,
        },
      });
      setOrder(res.data); // დადასტურება პასუხიდან, ლოკალური მდგომარეობიდან კი არა
      setHold(null);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      refreshLists();
    } catch (e) {
      if (e instanceof ApiError) {
        // 422 ველების შეცდომებით: ფორმა გაანაწილებს
        if (e.status === 422 && e.errors) throw e;
        // 422 მხოლოდ message-ით: hold-ის ვადა გავიდა
        if (e.status === 422) {
          setHold(null);
          setSelected([]);
          setStep("seats");
          setNotice(e.message);
          void refetchMap();
          return;
        }
        if (e.status === 409 && e.contested?.length) {
          reconcile(e.contested);
          return;
        }
      }
      throw e;
    } finally {
      setPaying(false);
    }
  };

  const close = () => {
    if (paying) return;
    // მოდალის დახურვისას ადგილები მაშინვე გვიბრუნდება რუკაზე
    if (hold) {
      void api(`/holds/${hold.holdId}`, { method: "DELETE", skipAuthRetry: true }).catch(() => {});
    }
    refreshLists();
    onClose();
  };

  const rows = selected.map((s) => ({
    seatId: s.seatId,
    code: codeOf(s.seatId),
    ticketType: s.ticketType,
    price: priceOf(s.ticketType),
  }));
  const alerts = [...violations, limitMsg, notice].filter((x): x is string => !!x);

  if (step === "done" && order) {
    return (
      <Modal
        open
        onClose={close}
        title="Booking confirmed"
        hideHeader
        className="w-[600px]"
      >
        <Confirmation
          order={order}
          onTickets={() => navigate("/profile?tab=tickets")}
          onHome={() => navigate("/")}
        />
      </Modal>
    );
  }

  const mapContent = seatMap.isLoading ? (
    <Skeleton className="h-[340px]" />
  ) : seatMap.isError && !seatMap.data ? (
    <ErrorState message="Couldn't load the hall map" onRetry={() => refetchMap()} />
  ) : seatMap.data ? (
    <div className={`transition-opacity ${seatMap.isFetching ? "opacity-60" : ""}`}>
      <HallMap
        map={seatMap.data}
        selectedIds={new Set(selected.map((s) => s.seatId))}
        lostCodes={lost}
        onToggle={toggleSeat}
      />
    </div>
  ) : null;

  return (
    <Modal
      open
      onClose={close}
      title={movie.title}
      subtitle={sessionSubtitle(session)}
      headerExtra={secondsLeft !== null ? <HoldTimer seconds={secondsLeft} /> : undefined}
      className="w-[1040px]"
    >
      {step === "checkout" && hold ? (
        <CheckoutStep
          session={session}
          hold={hold}
          user={user}
          onBack={() => setStep("seats")}
          onPay={pay}
        />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-8">
          <div>
            <StepTabs step="seats" />
            <div className="mt-5">{mapContent}</div>
          </div>
          <SeatsPanel
            rows={rows}
            allowedTypes={allowedTypes}
            max={max}
            subtotal={subtotal}
            alerts={alerts}
            pending={holding}
            canContinue={selected.length > 0 && violations.length === 0 && !seatMap.isLoading}
            onType={setTicketType}
            onRemove={removeSeat}
            onNext={goToCheckout}
          />
        </div>
      )}
    </Modal>
  );
}