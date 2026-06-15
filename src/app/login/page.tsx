// src/app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Key, UserCheck } from "lucide-react";

// This component parses URL parameters and renders credentials input elements.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [noPekerja, setNoPekerja] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error") ? "Log masuk gagal. Sila periksa No. Pekerja dan kata laluan anda." : null);
  const [loading, setLoading] = useState(false);

  // Handle credentials verification by calling NextAuth client handlers.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noPekerja || !password) {
      setError("Sila masukkan No. Pekerja dan kata laluan.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Trigger NextAuth credentials verification handler.
      const response = await signIn("credentials", {
        noPekerja,
        password,
        redirect: false,
      });

      if (response?.error) {
        setError("No. Pekerja atau Kata Laluan tidak sah.");
        setLoading(false);
      } else {
        // Redirect standard authenticated users to their corresponding dashboard routes.
        router.push("/dashboard/zakat");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Ralat sistem berlaku semasa log masuk.");
      setLoading(false);
    }
  };

  // Populate form credentials input states with test account values instantly.
  const fillTestCredentials = (noPek: string, pass: string) => {
    setNoPekerja(noPek);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 font-sans antialiased">
      
      {/* Background vector design elements */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(0,32,96,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,32,96,0.02)_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_80%,transparent_100%)]" />

      <div className="w-full max-w-md space-y-6">
        
        {/* Institutional UTHM Logo Header */}
        <div className="flex justify-center w-full">
          <Image
            src="/logo.png"
            alt="Logo UTHM"
            width={240}
            height={70}
            priority
            className="h-16 w-auto object-contain mix-blend-multiply dark:mix-blend-normal"
          />
        </div>

        {/* Credentials Form Layout Card */}
        <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95">
          <CardHeader className="border-b border-border bg-muted/10 px-6 py-6 text-center space-y-1">
            <CardTitle className="text-lg font-bold text-[#002060]">
              Log Masuk Portal Zakat Gaji
            </CardTitle>
            <CardDescription className="text-xs">
              Sistem Caruman Zakat Gaji UTHM
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="noPekerja" className="font-bold text-xs text-[#002060]">No. Pekerja</Label>
                <Input
                  id="noPekerja"
                  placeholder="Contoh: STAFF001"
                  value={noPekerja}
                  onChange={(e) => setNoPekerja(e.target.value)}
                  className="focus-visible:ring-[#002060] focus-visible:border-[#002060]"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-bold text-xs text-[#002060]">Kata Laluan</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-visible:ring-[#002060] focus-visible:border-[#002060]"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#002060] hover:bg-[#002060]/95 text-white font-bold py-2.5 text-xs tracking-wider shadow-md cursor-pointer transition-all"
              >
                {loading ? "Memproses Log Masuk..." : "LOG MASUK"}
              </Button>
            </form>

            {/* Prototype helper test accounts panel */}
            <div className="border-t pt-4 space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block text-center">
                Akaun Demonstrasi Pilihan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* Staff member credentials card */}
                <button
                  type="button"
                  onClick={() => fillTestCredentials("STAFF001", "password123")}
                  className="flex items-start gap-2 p-2.5 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-all text-left text-xs cursor-pointer group"
                >
                  <UserCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-foreground group-hover:text-[#002060]">Staf Biasa</div>
                    <div className="text-[10px] text-muted-foreground font-mono">ID: STAFF001</div>
                    <div className="text-[9px] text-muted-foreground/60 font-mono">Kata laluan: password123</div>
                  </div>
                </button>

                {/* Management Staff credentials card */}
                <button
                  type="button"
                  onClick={() => fillTestCredentials("MGR001", "password123")}
                  className="flex items-start gap-2 p-2.5 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-all text-left text-xs cursor-pointer group"
                >
                  <Key className="h-4 w-4 text-[#002060] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-foreground group-hover:text-[#002060]">Pengurusan</div>
                    <div className="text-[10px] text-muted-foreground font-mono">ID: MGR001</div>
                    <div className="text-[9px] text-muted-foreground/60 font-mono">Kata laluan: password123</div>
                  </div>
                </button>

              </div>
            </div>

          </CardContent>
        </Card>

        {/* Footer info copy */}
        <p className="text-center text-[10px] text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} Universiti Tun Hussein Onn Malaysia. Hak Cipta Terpelihara.
        </p>
      </div>
    </div>
  );
}

// This page component wraps the login form in a Suspense block to prevent static site prerendering bailout errors.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/40">
          <div className="text-xs font-bold text-[#002060] animate-pulse">Sila tunggu...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
