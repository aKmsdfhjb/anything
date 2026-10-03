"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import {
  Plane,
  Hotel,
  Ticket,
  Car,
  Shield,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle,
  AlertCircle,
  Search,
  DollarSign,
  Link2,
  ArrowLeft,
} from "lucide-react";

const CATEGORY_INFO = {
  flights: { label: "✈️ Flights", color: "#3B82F6", icon: Plane },
  hotels: { label: "🏨 Hotels & Accommodation", color: "#8B5CF6", icon: Hotel },
  activities: {
    label: "🎫 Tours & Activities",
    color: "#10B981",
    icon: Ticket,
  },
  car_rental: { label: "🚗 Car Rental", color: "#F59E0B", icon: Car },
  insurance: { label: "🛡️ Travel Insurance", color: "#EF4444", icon: Shield },
  multi: { label: "🌍 Multi-Service", color: "#06B6D4", icon: Globe },
  attractions: { label: "🎢 Attractions", color: "#EC4899", icon: Ticket },
};

export default function AffiliatesPage() {
  const { data: user, loading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editCode, setEditCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(null);

  const { data: affiliatesData, isLoading } = useQuery({
    queryKey: ["affiliates"],
    queryFn: async () => {
      const res = await fetch("/api/affiliates");
      if (!res.ok) throw new Error("Failed to fetch affiliates");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, affiliate_code }) => {
      const res = await fetch("/api/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, affiliate_code }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
      setEditingPartner(null);
      setSaveSuccess(data.partner?.partner_name);
      setTimeout(() => setSaveSuccess(null), 3000);
    },
  });

  const partners = affiliatesData?.partners || [];

  // Group by category
  const grouped = {};
  partners.forEach((p) => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  const filteredGrouped = {};
  Object.entries(grouped).forEach(([cat, items]) => {
    const filtered = items.filter(
      (p) =>
        p.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (filtered.length > 0) filteredGrouped[cat] = filtered;
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full"
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white mb-4">
            Sign in required
          </h1>
          <a
            href="/account/signin?callbackUrl=/admin/affiliates"
            className="bg-[#3B82F6] text-white font-bold py-3 px-8 rounded-xl"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] px-5 md:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <a
              href="/"
              className="bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </a>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">
                Affiliate Partners
              </h1>
              <p className="text-white text-opacity-80 text-sm mt-1">
                Set up your affiliate links to earn commission on bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 mt-8">
        {/* Info box */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-bold mb-2">
                How affiliate links work
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-3">
                Sign up with each travel partner below to get your unique
                affiliate code. When users book through your TipTrip links, you
                earn commission on each booking. Links will appear on
                destination pages and in tip recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#10B981] bg-opacity-20 text-[#10B981] text-xs font-bold px-3 py-1 rounded-full">
                  Step 1: Sign up with partner
                </span>
                <span className="bg-[#3B82F6] bg-opacity-20 text-[#3B82F6] text-xs font-bold px-3 py-1 rounded-full">
                  Step 2: Get your affiliate code
                </span>
                <span className="bg-[#8B5CF6] bg-opacity-20 text-[#8B5CF6] text-xs font-bold px-3 py-1 rounded-full">
                  Step 3: Enter it below
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success message */}
        {saveSuccess && (
          <div className="bg-[#10B981] bg-opacity-15 border border-[#10B981] border-opacity-30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <p className="text-[#10B981] font-semibold text-sm">
              Affiliate code saved for {saveSuccess}!
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partners..."
            className="w-full bg-[#1E293B] border border-[#334155] rounded-2xl pl-12 pr-4 py-3 text-white font-semibold outline-none focus:border-[#3B82F6] transition-all placeholder-[#64748B]"
          />
        </div>

        {/* Partner categories */}
        {isLoading ? (
          <div className="text-center py-12">
            <div
              className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-4"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p className="text-[#64748B]">Loading partners...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredGrouped).map(([cat, items]) => {
              const catInfo = CATEGORY_INFO[cat] || {
                label: cat,
                color: "#64748B",
                icon: Globe,
              };
              const isExpanded =
                expandedCategory === cat || expandedCategory === null;
              const activeCount = items.filter((p) => p.affiliate_code).length;

              return (
                <div
                  key={cat}
                  className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedCategory(expandedCategory === cat ? null : cat)
                    }
                    className="w-full p-5 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: catInfo.color + "20" }}
                      >
                        {catInfo.label.split(" ")[0]}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">
                          {catInfo.label.substring(
                            catInfo.label.indexOf(" ") + 1,
                          )}
                        </h3>
                        <p className="text-[#64748B] text-xs">
                          {items.length} partners • {activeCount} connected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeCount > 0 && (
                        <span className="bg-[#10B981] bg-opacity-20 text-[#10B981] text-xs font-bold px-2 py-1 rounded-lg">
                          {activeCount} active
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#64748B]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#64748B]" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#334155]">
                      {items.map((partner) => {
                        const isEditing = editingPartner === partner.id;
                        const hasCode = !!partner.affiliate_code;

                        return (
                          <div
                            key={partner.id}
                            className="p-5 border-b border-[#334155] last:border-0"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-bold">
                                    {partner.partner_name}
                                  </h4>
                                  {hasCode && (
                                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                                  )}
                                </div>
                                <p className="text-[#94A3B8] text-sm mb-3">
                                  {partner.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[#0F172A] text-[#10B981]">
                                    {parseFloat(partner.commission_rate)}%
                                    commission
                                  </span>
                                  <a
                                    href={partner.base_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold px-2 py-1 rounded-lg bg-[#0F172A] text-[#3B82F6] hover:text-white transition-colors flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" /> Visit
                                    site
                                  </a>
                                  {partner.affiliate_signup_url && (
                                    <a
                                      href={partner.affiliate_signup_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold px-2 py-1 rounded-lg bg-[#FF006E] bg-opacity-15 text-[#FF006E] hover:bg-opacity-25 transition-colors flex items-center gap-1"
                                    >
                                      <Link2 className="w-3 h-3" /> Sign up for
                                      affiliate
                                    </a>
                                  )}
                                  {!partner.affiliate_signup_url && (
                                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[#0F172A] text-[#64748B] flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> No
                                      affiliate program
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Affiliate code input */}
                            {partner.affiliate_signup_url && (
                              <div className="mt-2">
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editCode}
                                      onChange={(e) =>
                                        setEditCode(e.target.value)
                                      }
                                      placeholder="Paste your affiliate code here..."
                                      className="flex-1 bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm font-semibold outline-none focus:border-[#3B82F6] transition-all placeholder-[#64748B]"
                                    />
                                    <button
                                      onClick={() =>
                                        updateMutation.mutate({
                                          id: partner.id,
                                          affiliate_code: editCode,
                                        })
                                      }
                                      disabled={updateMutation.isPending}
                                      className="bg-[#10B981] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#059669] transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <Save className="w-4 h-4" />
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingPartner(null)}
                                      className="bg-[#334155] text-white px-3 py-2.5 rounded-xl text-sm hover:bg-[#475569] transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {hasCode ? (
                                      <>
                                        <div className="flex-1 bg-[#0F172A] border border-[#10B981] border-opacity-30 rounded-xl px-4 py-2.5 text-[#10B981] text-sm font-mono">
                                          {partner.affiliate_code}
                                        </div>
                                        <button
                                          onClick={() => {
                                            setEditingPartner(partner.id);
                                            setEditCode(
                                              partner.affiliate_code || "",
                                            );
                                          }}
                                          className="bg-[#334155] text-white px-4 py-2.5 rounded-xl text-sm hover:bg-[#475569] transition-all font-semibold"
                                        >
                                          Edit
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingPartner(partner.id);
                                          setEditCode("");
                                        }}
                                        className="bg-[#3B82F6] bg-opacity-15 text-[#3B82F6] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-opacity-25 transition-all"
                                      >
                                        + Add affiliate code
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
