"use client";

import { useState } from "react";
import { ClipboardTabNavigation } from "../ClipboardTabNavigation";
import { ChecklistSection } from "./ChecklistSection";
import { DocumentsSection } from "./DocumentsSection";
import { BookingSection } from "./BookingSection";

export function ClipboardTab({ trip }) {
  const [subTab, setSubTab] = useState("checklist");

  return (
    <div>
      <ClipboardTabNavigation
        activeSubTab={subTab}
        onSubTabChange={setSubTab}
      />

      {subTab === "checklist" && <ChecklistSection trip={trip} />}
      {subTab === "documents" && <DocumentsSection trip={trip} />}
      {subTab === "booking" && <BookingSection trip={trip} />}
    </div>
  );
}
