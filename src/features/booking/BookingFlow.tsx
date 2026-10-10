import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { ApiResponse, Session } from "../../api/types";
import { useAuth } from "../../auth/useAuth";
import ErrorState from "../../components/ErrorState";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import BookingModal from "./BookingModal";

type Props = { sessionId: number; onClose: () => void };

export default function BookingFlow({ sessionId, onClose }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const options = useFilterOptions();
  const session = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => (await api<ApiResponse<Session>>(`/sessions/${sessionId}`)).data,
  });

  if (!user) return null;

  if (!user.profileComplete) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Complete your profile"
        subtitle="Booking needs your name, mobile number and date of birth"
      >
        <p className="text-sm text-white/70">Please complete your profile to enable booking.</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-full bg-white/15 text-xs font-bold hover:bg-white/25"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="h-11 flex-1 rounded-full bg-accent text-xs font-bold hover:bg-accent-hover"
          >
            Go to profile
          </button>
        </div>
      </Modal>
    );
  }

  if (session.isError || options.isError) {
    return (
      <Modal open onClose={onClose} title="Booking">
        <ErrorState
          message="Couldn't load this session"
          onRetry={() => {
            void session.refetch();
            void options.refetch();
          }}
        />
      </Modal>
    );
  }

  if (!session.data || !options.data) {
    return (
      <Modal open onClose={onClose} title="Loading session" className="w-[1040px]">
        <div aria-busy="true" className="space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-[320px]" />
        </div>
      </Modal>
    );
  }

  const { ageRating } = session.data.movie;
  if (user.age !== null && user.age < ageRating.minAge) {
    return (
      <Modal open onClose={onClose} title="Not available" subtitle={session.data.movie.title}>
        <p className="text-sm text-white/70">
          This film is rated {ageRating.code}. You cannot buy tickets for it with this account.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-11 w-full rounded-full bg-white/15 text-xs font-bold hover:bg-white/25"
        >
          Close
        </button>
      </Modal>
    );
  }

  return (
    <BookingModal session={session.data} options={options.data} user={user} onClose={onClose} />
  );
}