import { MessageSquare } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-20 sm:w-24 lg:w-80 xl:w-96 bg-base-100/60 backdrop-blur-2xl border-r border-white/10 flex flex-col">
      <div className="hidden lg:block p-5 border-b border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-3 w-32" />
          </div>
        </div>
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="skeleton h-10 w-full rounded-xl" />
      </div>

      <div className="overflow-y-auto p-2 lg:p-3 space-y-1 flex-1">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-2 lg:p-3 flex items-center gap-3">
            <div className="skeleton size-11 lg:size-12 rounded-full mx-auto lg:mx-0 shrink-0" />
            <div className="hidden lg:block flex-1 space-y-2">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
