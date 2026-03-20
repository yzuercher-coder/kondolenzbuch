"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  userName: string;
}

export default function BenutzerActions({ userId, userName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deleteUser() {
    if (!confirm(`Benutzer "${userName}" wirklich löschen?`)) return;
    setLoading(true);
    await fetch(`/api/benutzer/${userId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={deleteUser} disabled={loading} className="btn-danger">
      Löschen
    </button>
  );
}
