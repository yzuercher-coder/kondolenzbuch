import UnternehmenFormular from "@/components/admin/UnternehmenFormular";

export default function NeuesUnternehmenPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Neues Unternehmen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Bestattungsunternehmen erfassen</p>
      </div>
      <UnternehmenFormular />
    </div>
  );
}
