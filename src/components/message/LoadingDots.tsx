export default function LoadingDots() {
  return (
    <div className="flex gap-1">
      <span className="animate-[bounce_1.4s_ease-in-out_0s_infinite]">.</span>
      <span className="animate-[bounce_1.4s_ease-in-out_0.2s_infinite]">.</span>
      <span className="animate-[bounce_1.4s_ease-in-out_0.4s_infinite]">.</span>
    </div>
  );
}
