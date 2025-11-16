"use client";

import { useState } from "react";
import { generatePitchDeckAction } from "./actions";

export default function PitchDeckPage() {
  const [result, setResult] = useState("");

  async function onSubmit(formData) {
    const r = await generatePitchDeckAction(formData);
    setResult(r.output);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pitch Deck Assistant</h1>

      <form action={onSubmit} className="space-y-4">
        <input name="startupName" placeholder="Startup Name" className="input" />
        <input name="oneLiner" placeholder="One-liner" className="input" />
        <input name="industry" placeholder="Industry" className="input" />
        <input name="country" placeholder="Country" className="input" />
        <input name="targetAudience" placeholder="Target Audience" className="input" />
        <textarea name="problem" placeholder="Problem" className="textarea" />
        <textarea name="solution" placeholder="Solution" className="textarea" />
        <textarea name="traction" placeholder="Traction (optional)" className="textarea" />
        <input name="revenueModel" placeholder="Revenue Model" className="input" />
        <textarea name="competitors" placeholder="Competitors" className="textarea" />
        <input name="fundingNeed" placeholder="Funding Need" className="input" />
        <textarea name="team" placeholder="Team Overview" className="textarea" />

        <button className="btn-primary w-full">Generate Pitch Deck</button>
      </form>

      {result && (
        <div className="p-4 bg-white shadow rounded mt-6 whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
