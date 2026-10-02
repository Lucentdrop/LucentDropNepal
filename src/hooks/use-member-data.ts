"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers";
import {
  getSavedProducts,
  getQuotations,
  toggleSaved,
  requestQuotation,
  getDocuments,
  getNotifications,
} from "@/lib/api/member.service";
export function useMemberData() {
  const { member } = useAuth();
  const queryClient = useQueryClient();
  const identity = member?.id;
  const saved = useQuery({
    queryKey: ["saved", identity],
    queryFn: () => getSavedProducts(member!),
    enabled: !!member,
  });
  const quotations = useQuery({
    queryKey: ["quotations", identity],
    queryFn: () => getQuotations(member!),
    enabled: !!member,
  });
  const documents = useQuery({
    queryKey: ["documents", identity],
    queryFn: () => getDocuments(member!),
    enabled: !!member,
  });
  const messages = useQuery({
    queryKey: ["messages", identity],
    queryFn: () => getNotifications(member!),
    enabled: !!member,
  });
  const saveMutation = useMutation({
    mutationFn: ({ id, isSaved }: { id: string; isSaved: boolean }) =>
      toggleSaved(member!, id, isSaved),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["saved", identity] }),
  });
  const quotationMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      requestQuotation(member!, id, message),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["quotations", identity] }),
  });
  return {
    saved,
    quotations,
    documents,
    messages,
    saveMutation,
    quotationMutation,
  };
}
