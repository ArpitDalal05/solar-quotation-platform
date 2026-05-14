import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type Quotation = {
  id: number;
  quotationNumber: string;
  status: string;
  pdfUrl: string | null;
  createdAt: string;
  totalAmount: number;
  netPayableAmount: number;
  subsidyAmount: number;
};

export function CustomerQuotations() {
  const [rows, setRows] = useState<Quotation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/quotations/my")
      .then((r) => setRows(r.data))
      .catch(() => setError("Failed to load quotations"));
  }, []);

  const handleDownload = (q: Quotation) => {
    if (!q.pdfUrl) return;
    window.open(`${API_BASE}${q.pdfUrl}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold text-slate-900">Quotations</div>
        <div className="text-sm text-slate-600">
          Download quotation PDFs shared with you.
        </div>
      </div>

      {error ? (
        <div className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md">
          {error}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No quotations yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map((q) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{q.quotationNumber}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-slate-600">
                    Date: {new Date(q.createdAt).toLocaleDateString()}
                  </div>
                  <div
                    className={
                      q.status === "ACCEPTED"
                        ? "text-emerald-700 font-medium"
                        : q.status === "REJECTED"
                          ? "text-red-700 font-medium"
                          : "text-slate-700 font-medium"
                    }
                  >
                    {q.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white border border-amber-100 px-3 py-2">
                    <div className="text-xs text-slate-500">Total</div>
                    <div className="font-semibold">
                      ₹{q.totalAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-amber-100 px-3 py-2">
                    <div className="text-xs text-slate-500">Net payable</div>
                    <div className="font-semibold">
                      ₹{q.netPayableAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  disabled={!q.pdfUrl}
                  onClick={() => handleDownload(q)}
                  className="border-amber-200 hover:bg-amber-50"
                >
                  {q.pdfUrl ? "Download PDF" : "PDF not available"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

