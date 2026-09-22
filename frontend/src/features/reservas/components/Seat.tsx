import { SeatStatus } from "../types";

interface SeatProps {
  label: string;
  status: SeatStatus;
  onClick: () => void;
}

const styles: Record<SeatStatus, string> = {
  available:
    "bg-white border-[#d2d2d7] text-[#6e6e73] hover:border-[#0071e3] hover:text-[#0071e3] cursor-pointer",
  selected:
    "bg-[#0071e3] border-[#0071e3] text-white shadow-md scale-105 cursor-pointer",
  occupied: "bg-[#e8e8ed] border-[#e8e8ed] text-[#a1a1a6] cursor-not-allowed",
};

export function Seat({ label, status, onClick }: Readonly<SeatProps>) {
  return (
    <button
      type="button"
      disabled={status === "occupied"}
      onClick={onClick}
      aria-label={`Asiento ${label}`}
      aria-pressed={status === "selected"}
      title={label}
      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-t-appleMd rounded-b-md border text-[10px] font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 ${styles[status]}`}
    >
      {label.replace(/^[A-Za-z]+/, "")}
    </button>
  );
}
