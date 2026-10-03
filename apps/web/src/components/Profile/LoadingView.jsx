export function LoadingView() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
      <div
        className="w-10 h-10 border-[3px] border-gray-200 border-t-[#008C8F] rounded-full"
        style={{ animation: "spin .8s linear infinite" }}
      ></div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
