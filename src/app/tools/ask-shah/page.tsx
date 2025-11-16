import AskShahBox from "@/components/AskShahBox";
import { getOrCreateConversation } from "./actions";

export const dynamic = 'force-dynamic';

export default async function AskShahPage() {
  // This action currently only supports guest mode due to server-side auth limitations.
  const result = await getOrCreateConversation();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Ask Shah</h1>
      <AskShahBox
        initialMode={result.mode}
        initialConversationId={result.conversationId}
      />
    </div>
  );
}
