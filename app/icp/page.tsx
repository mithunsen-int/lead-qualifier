import ICPTable from "@/components/ICPTable";

export default function ICPPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ICP Data</h1>
        <p className="text-sm text-slate-600">
          Manage and explore Ideal Customer Profile (ICP) data.
        </p>
      </div>
      <ICPTable />
    </div>
  );
}
