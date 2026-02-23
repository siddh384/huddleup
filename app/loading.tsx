import Loader from "@/components/shared/loader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full min-h-[50vh] px-4 py-10">
      <Loader />
    </div>
  );
}
