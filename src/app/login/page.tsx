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
import { AlertCircle, Key, UserCheck, Mail, ArrowLeft, CheckCircle } from "lucide-react";

// This component parses URL parameters and renders credentials input elements or forgot password templates.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Login form inputs and validation states
  const [noPekerja, setNoPekerja] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error") ? "Log masuk gagal. Sila periksa No. Pekerja dan kata laluan anda." : null);
  const [loading, setLoading] = useState(false);

  // Forgot Password modal toggle states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotNoPekerja, setForgotNoPekerja] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

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

  // Handle forgot password mock requests gracefully.
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotNoPekerja || !forgotEmail) {
      setForgotError("Sila isi semua ruangan yang diperlukan.");
      return;
    }

    if (!forgotEmail.endsWith("@uthm.edu.my")) {
      setForgotError("Sila gunakan emel rasmi UTHM berakhiran @uthm.edu.my.");
      return;
    }

    // Set success state to show confirmation feedback
    setForgotSuccess(true);
  };

  // Populate form credentials input states with test account values instantly without displaying the raw passwords.
  const fillTestCredentials = (noPek: string) => {
    setNoPekerja(noPek);
    setPassword("password123");
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

        {/* Credentials Form Layout Card - Conditionally renders Login or Forgot Password */}
        {!isForgotMode ? (
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-bold text-xs text-[#002060]">Kata Laluan</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setForgotSuccess(false);
                        setForgotError(null);
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Lupa Kata Laluan?
                    </button>
                  </div>
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

              {/* Prototype helper test accounts panel with default passwords hidden */}
              <div className="border-t pt-4 space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block text-center">
                  Akaun Demonstrasi Pilihan
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  
                  {/* Staff member credentials card */}
                  <button
                    type="button"
                    onClick={() => fillTestCredentials("STAFF001")}
                    className="flex items-start gap-2 p-2.5 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-all text-left text-xs cursor-pointer group"
                  >
                    <UserCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground group-hover:text-[#002060]">Staf Biasa</div>
                      <div className="text-[10px] text-muted-foreground font-mono">ID: STAFF001</div>
                      <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">Sedia dimasukkan</div>
                    </div>
                  </button>

                  {/* Management Staff credentials card */}
                  <button
                    type="button"
                    onClick={() => fillTestCredentials("MGR001")}
                    className="flex items-start gap-2 p-2.5 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-all text-left text-xs cursor-pointer group"
                  >
                    <Key className="h-4 w-4 text-[#002060] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground group-hover:text-[#002060]">Pengurusan</div>
                      <div className="text-[10px] text-muted-foreground font-mono">ID: MGR001</div>
                      <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">Sedia dimasukkan</div>
                    </div>
                  </button>

                </div>
              </div>

            </CardContent>
          </Card>
        ) : (
          /* FORGOT PASSWORD SECTION */
          <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader className="border-b border-border bg-muted/10 px-6 py-6 text-center space-y-1">
              <CardTitle className="text-lg font-bold text-[#002060]">
                Set Semula Kata Laluan
              </CardTitle>
              <CardDescription className="text-xs">
                Sila lengkapkan butiran pengesahan staf
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              {forgotSuccess ? (
                /* Success Notification Box */
                <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">Permintaan Berjaya Diterima</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Pautan arahan set semula kata laluan telah dihantar ke emel berdaftar UTHM anda:
                      <br />
                      <span className="font-bold text-[#002060] dark:text-blue-300">{forgotEmail}</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsForgotMode(false);
                      setForgotSuccess(false);
                      setForgotNoPekerja("");
                      setForgotEmail("");
                    }}
                    className="w-full text-xs h-9 cursor-pointer"
                  >
                    Kembali Ke Log Masuk
                  </Button>
                </div>
              ) : (
                /* Reset Form Elements */
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="forgotNoPekerja" className="font-bold text-xs text-[#002060]">No. Pekerja</Label>
                    <Input
                      id="forgotNoPekerja"
                      placeholder="Contoh: STAFF001"
                      value={forgotNoPekerja}
                      onChange={(e) => setForgotNoPekerja(e.target.value)}
                      className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="forgotEmail" className="font-bold text-xs text-[#002060]">Emel Rasmi UTHM</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgotEmail"
                        type="email"
                        placeholder="nama@uthm.edu.my"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-9 focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#002060] hover:bg-[#002060]/95 text-white font-bold py-2.5 text-xs tracking-wider shadow-md cursor-pointer transition-all"
                  >
                    HANTAR PAUTAN SET SEMULA
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsForgotMode(false)}
                    className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-all pt-1 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Log Masuk
                  </button>
                </form>
              )}

            </CardContent>
          </Card>
        )}

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
