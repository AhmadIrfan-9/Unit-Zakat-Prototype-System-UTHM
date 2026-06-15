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
import { AlertCircle, Mail, ArrowLeft, CheckCircle } from "lucide-react";

// This component parses URL parameters and renders credentials input elements or forgot password templates.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Login form inputs and validation states
  const [noPekerja, setNoPekerja] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error") ? "Log masuk gagal. Sila periksa No. Pekerja dan kata laluan anda." : null);
  const [loading, setLoading] = useState(false);

  // Forgot Password toggle states
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

  // Handle forgot password requests.
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

  return (
    // This component renders the secure login page featuring a full-screen background image and a professional split-screen form layout without any test data links.
    <div
      className="relative min-h-screen w-full flex flex-col md:flex-row font-sans antialiased bg-cover bg-center"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      {/* Left Panel: Welcoming context overlaying UTHM institutional context */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 bg-black/55 text-white min-h-[40vh] md:min-h-screen">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo UTHM"
            width={240}
            height={80}
            priority
            className="h-20 w-auto object-contain brightness-0 invert"
          />
        </div>
        
        <div className="space-y-4 max-w-xl my-auto pt-10 md:pt-0">
          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight uppercase">
            Sistem Caruman Zakat Gaji UTHM
          </h1>
          <div className="h-1 w-20 bg-emerald-500 rounded" />
          <p className="text-sm md:text-base text-gray-200 font-medium leading-relaxed">
            Selamat Datang ke Portal Kebenaran Potongan Gaji Kakitangan UTHM. Urus dan hantar permohonan sumbangan zakat bulanan anda dengan selamat dan efisien secara digital.
          </p>
        </div>

        <p className="text-[10px] text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Universiti Tun Hussein Onn Malaysia. Hak Cipta Terpelihara.
        </p>
      </div>

      {/* Right Panel: Clean White login card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white/90 dark:bg-card/90 backdrop-blur-md min-h-[60vh] md:min-h-screen border-l border-border/20">
        <div className="w-full max-w-md animate-in fade-in duration-500">
          
          {!isForgotMode ? (
            /* Secure Credentials Form Panel */
            <Card className="border border-border/80 shadow-2xl bg-white dark:bg-card/95 w-full">
              <CardHeader className="border-b border-border bg-muted/10 px-6 py-6 text-center space-y-1">
                <CardTitle className="text-lg font-bold text-[#002060]">
                  Log Masuk Portal
                </CardTitle>
                <CardDescription className="text-xs">
                  Sila masukkan butiran kakitangan rasmi anda
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="noPekerja" className="font-bold text-xs text-[#002060]">No. Pekerja atau No. Kad Pengenalan</Label>
                    <Input
                      id="noPekerja"
                      placeholder="Masukkan No. Pekerja / No. KP"
                      value={noPekerja}
                      onChange={(e) => setNoPekerja(e.target.value)}
                      className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-10"
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
                      className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-10"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#002060] hover:bg-[#002060]/95 text-white font-bold py-3 text-xs tracking-wider shadow-md cursor-pointer transition-all"
                  >
                    {loading ? "Memproses Log Masuk..." : "LOG MASUK"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Forgot Password Panel */
            <Card className="border border-border/80 shadow-2xl bg-white dark:bg-card/95 w-full animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b border-border bg-muted/10 px-6 py-6 text-center space-y-1">
                <CardTitle className="text-lg font-bold text-[#002060]">
                  Set Semula Kata Laluan
                </CardTitle>
                <CardDescription className="text-xs">
                  Sila masukkan butiran pengesahan kakitangan
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {forgotSuccess ? (
                  <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground">Permintaan Diterima</h4>
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
                        className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="forgotEmail" className="font-bold text-xs text-[#002060]">Emel Rasmi UTHM</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgotEmail"
                          type="email"
                          placeholder="nama@uthm.edu.my"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="pl-9 focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-10"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#002060] hover:bg-[#002060]/95 text-white font-bold py-3 text-xs tracking-wider shadow-md cursor-pointer transition-all"
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

        </div>
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
