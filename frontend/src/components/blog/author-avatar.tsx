export function AuthorAvatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-full font-semibold text-[#1d1604]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.46,
        background: "linear-gradient(135deg, #fbebaa, #cfa535)",
      }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
