"use client";
// One-time hydration from browser-only storage or URL state is intentional.
/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers";
import { useMemberData } from "@/hooks/use-member-data";
import { getSupabase } from "@/lib/supabase/client";
import { DashboardHeading } from "./dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { formatDate } from "@/lib/utils";
type Message = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
};
export function QuotationConversation() {
  const [id, setId] = useState("");
  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id") ?? "");
  }, []);
  const { member } = useAuth();
  const { quotations } = useMemberData();
  const [body, setBody] = useState("");
  const qc = useQueryClient();
  const quotation = quotations.data?.find((q) => q.id === id);
  const messages = useQuery({
    queryKey: ["quotation-messages", member?.id, id],
    enabled: !!quotation && !!member,
    queryFn: async (): Promise<Message[]> => {
      if (member?.isDemo) return [];
      const { data, error } = await getSupabase()!
        .from("quotation_messages")
        .select("id,body,created_at,sender_id")
        .eq("quotation_request_id", id)
        .order("created_at");
      if (error) throw new Error("Unable to load this conversation.");
      return data;
    },
  });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!member || member.isDemo)
        throw new Error(
          "Conversation sending requires a connected Supabase account.",
        );
      if (body.trim().length < 2 || body.length > 3000)
        throw new Error("Enter a message between 2 and 3,000 characters.");
      const { error } = await getSupabase()!.from("quotation_messages").insert({
        quotation_request_id: id,
        sender_id: member.id,
        body: body.trim(),
      });
      if (error) throw new Error("Unable to send your message.");
    },
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({
        queryKey: ["quotation-messages", member?.id, id],
      });
    },
  });
  return (
    <>
      <DashboardHeading
        title="Quotation Conversation"
        description="Discuss the requirements for your request."
      />
      <Link href="/dashboard/quotations" className="text-link mb-5">
        ← All quotation requests
      </Link>
      {quotations.isPending ? (
        <div
          className="skeleton image"
          role="status"
          aria-label="Loading quotation"
        />
      ) : !quotation ? (
        <EmptyState
          title="Quotation not found"
          description="Select one of your requests to view the conversation."
        />
      ) : (
        <div className="dashboard-panel">
          <h2>Request {quotation.id.slice(0, 8)}</h2>
          <p className="notice">{quotation.message}</p>
          {member?.isDemo ? (
            <div className="notice warning">
              Demo conversations are a preview. Connect Supabase to exchange
              real messages.
            </div>
          ) : messages.isError ? (
            <div className="notice error" role="alert">
              {messages.error.message}
              <Button size="sm" onClick={() => messages.refetch()}>
                Retry
              </Button>
            </div>
          ) : messages.isPending ? (
            <p role="status">Loading conversation…</p>
          ) : messages.data?.length ? (
            messages.data.map((m) => (
              <div className="quotation-row" key={m.id}>
                <div>
                  <strong>{m.sender_id === member?.id ? "You" : "Team"}</strong>
                  <p>{m.body}</p>
                  <small>{formatDate(m.created_at)}</small>
                </div>
              </div>
            ))
          ) : (
            <p>No replies yet. Add a message below.</p>
          )}
          {!member?.isDemo && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
              className="mt-6"
            >
              <div className="field">
                <label htmlFor="conversation-message">Message</label>
                <textarea
                  id="conversation-message"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  minLength={2}
                  maxLength={3000}
                  required
                />
              </div>
              {mutation.isError && (
                <div className="notice error mt-4" role="alert">
                  {mutation.error.message}
                </div>
              )}
              <Button className="mt-4" disabled={mutation.isPending}>
                {mutation.isPending ? "Sending…" : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
