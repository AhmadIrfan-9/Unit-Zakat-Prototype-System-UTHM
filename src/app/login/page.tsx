// src/app/login/page.tsx
// This login component dispatches credentials and redirects the authenticated session to the system root path for automated role-based dashboard filtering.
"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { registerNewStaffAccount } from "@/app/actions/zakatUserRegistrationServerActions";

// This inner component contains all stateful login form logic and is wrapped in Suspense by the outer export.
function LoginForm() {
  // This router hook enables imperative client-side navigation after a successful sign-in.
  const router = useRouter();

  // This hook reads the URL search parameters to detect provider-level error codes on mount.
  const searchParams = useSearchParams();

  // This state holds the employee number or national identity card string entered by the user.
  const [noPekerja, setNoPekerja] = useState("");

  // This state holds the plaintext password string before it is dispatched to the auth provider.
  const [password, setPassword] = useState("");

  // This state holds the active error message surfaced to the user, seeded from the URL error param.
  const [error, setError] = useState<string | null>(
    searchParams.get("error")
      ? "Log masuk gagal. Sila periksa No. Pekerja dan kata laluan anda."
      : null
  );

  // This state tracks whether the credential submission is currently in-flight.
  const [loading, setLoading] = useState(false);

  // This state holds the employee number entered inside the password reset sub-form.
  const [forgotNoPekerja, setForgotNoPekerja] = useState("");

  // This state holds the UTHM institutional email entered inside the password reset sub-form.
  const [forgotEmail, setForgotEmail] = useState("");

  // This state tracks whether the reset request was submitted successfully.
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // This state holds any validation or domain error from the reset form submission.
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Suntik parameter keadaan state baharu ini di dalam LoginForm()
  const mode = searchParams.get("mode");
  const isRegisterMode = mode === "register";
  const isForgotMode = mode === "forgot";

  const [registerNoPekerja, setRegisterNoPekerja] = useState("");
  const [registerNama, setRegisterNama] = useState("");
  const [registerFakulti, setRegisterFakulti] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);


  // This handler dispatches validated registration payload to the server action.
  const handleExecuteRegistrationAction = async () => {
    if (!registerNama.trim() || !registerNoPekerja.trim() || !registerFakulti) {
      setRegisterError("Sila lengkapkan semua ruangan pendaftaran.");
      return;
    }
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const result = await registerNewStaffAccount({
        name: registerNama.trim(),
        noPekerja: registerNoPekerja.trim(),
        fakulti: registerFakulti,
      });
      if (result.success) {
        router.push("/login");
        setRegisterNama("");
        setRegisterNoPekerja("");
        setRegisterFakulti("");
      } else {
        setRegisterError(result.error || "Pendaftaran gagal.");
      }
    } catch {
      setRegisterError("Ralat sistem berlaku semasa pendaftaran.");
    } finally {
      setRegisterLoading(false);
    }
  };

  // Incremental patch binding dynamic brute-force remaining count warnings directly onto the frontend portal access alert card.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noPekerja || !password) {
      setError("Sila masukkan No. Pekerja dan kata laluan.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // This call executes credential verification without a hard redirect so we can inspect the result first.
      const response = await signIn("credentials", {
        noPekerja,
        password,
        redirect: false,
      });

      if (response?.error) {
        // Read the server-propagated exception text message dynamically — carries lockout time or remaining attempts payload.
        const rawMessage = response.error;
        const isBruteForceMessage =
          rawMessage.includes("Baki cubaan") ||
          rawMessage.includes("dikunci") ||
          rawMessage.includes("Had cubaan");

        setError(
          isBruteForceMessage
            ? rawMessage
            : "No. Pekerja atau Kata Laluan yang anda masukkan adalah salah!"
        );
        setLoading(false);
      } else {
        // Redirect to target dashboard and refresh cache to display user information instantly
        router.prefetch("/dashboard/zakat");
        setTimeout(() => {
          router.push("/dashboard/zakat?tab=info");
          router.refresh();
        }, 50);
      }
    } catch (err) {
      console.error("[LoginForm] signIn error:", err);
      // Surface the thrown Error message if it is an instance of Error, otherwise use a generic fallback.
      const message = err instanceof Error ? err.message : "Ralat sistem berlaku semasa log masuk.";
      setError(message);
      setLoading(false);
    }
  };

  // This handler validates the reset form fields and marks the request as submitted when all checks pass.
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

    // This flag switches the reset card to its success confirmation view.
    setForgotSuccess(true);
  };

  return (
    // This wrapper renders the split-screen login layout with the mosque image on the left and the form card on the right.
    <main className="relative min-h-screen w-full flex flex-col md:flex-row font-sans antialiased bg-background">

      {/* Left Panel: full-height cover image with dark overlay and branded title */}
      <div
        className="flex-1 flex flex-col justify-between p-8 md:p-16 text-white min-h-[40vh] md:min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('/image (2).png')" }}
      >
        {/* This overlay tints the background image to ensure title text remains legible. */}
        <div className="absolute inset-0 bg-black/40 z-0" />

        <div className="relative z-10 flex flex-col justify-between h-full min-h-[35vh] md:min-h-[85vh]">
          <div className="h-1" />

          {/* This block renders the system title and tagline over the left panel image. */}
          <div className="space-y-4 max-w-xl my-auto pt-10 md:pt-0">
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight uppercase">
              Sistem Caruman Zakat Gaji UTHM
            </h1>
            <div className="h-1 w-20 bg-emerald-500 rounded" />
            <p className="text-sm md:text-base text-gray-200 font-medium leading-relaxed">
              Selamat Datang ke Portal Kebenaran Potongan Gaji Kakitangan UTHM.
              Urus dan hantar permohonan sumbangan zakat bulanan anda dengan
              selamat dan efisien secara digital.
            </p>
          </div>

          {/* This line renders the institutional copyright notice at the bottom of the left panel. */}
          <p className="text-[10px] text-gray-400 font-medium pt-8 md:pt-0">
            &copy; {new Date().getFullYear()} Universiti Tun Hussein Onn Malaysia. Hak Cipta Terpelihara.
          </p>
        </div>
      </div>

      {/* Right Panel: white credential card area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-card min-h-[60vh] md:min-h-screen border-l border-border/20">
        <div className="w-full max-w-md animate-in fade-in duration-500">

          {/* Incremental patch structuring a clean state switch view for register vs login vs forgot modes. */}
          {isRegisterMode ? (
            // Kad Pendaftaran Kakitangan Baharu Eksklusif (Halaman tidak lagi bertumpuk)
            <Card className="border border-border/80 shadow-2xl bg-white w-full animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b border-border bg-muted/10 px-6 py-6 text-center space-y-4">
                {/* Dual-logo header row mirroring the login card. */}
                <div className="flex items-center justify-center gap-6 pb-2">
                  <Image src="/image_bb5246.png" alt="Logo Rasmi Universiti Tun Hussein Onn Malaysia (UTHM) Johor" width={120} height={40} priority className="h-12 w-auto object-contain" style={{ width: "auto" }} />
                  <Image src="/image_bb546b.png" alt="Logo Rasmi Unit Kutipan Zakat Pusat Islam UTHM" width={90} height={30} priority className="h-10 w-auto object-contain" style={{ width: "auto" }} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-[#002060]">Borang Pendaftaran Kakitangan</CardTitle>
                  <CardDescription className="text-xs">Isi butiran berikut untuk mencipta akaun portal baharu</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {registerError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="regNama" className="font-bold text-xs text-[#002060]">Nama Penuh</Label>
                  <Input
                    id="regNama"
                    type="text"
                    placeholder="Masukkan nama penuh"
                    value={registerNama}
                    onChange={(e) => setRegisterNama(e.target.value)}
                    className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-10"
                    disabled={registerLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="regNoStaf" className="font-bold text-xs text-[#002060]">No. Pekerja</Label>
                  <Input
                    id="regNoStaf"
                    type="text"
                    placeholder="Contoh: STAFF001"
                    value={registerNoPekerja}
                    onChange={(e) => setRegisterNoPekerja(e.target.value)}
                    className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-10"
                    disabled={registerLoading}
                  />
                </div>

                {/* Penambahan Bahagian Fakulti Yang Tertinggal Berdasarkan Standard UTHM */}
                <div className="space-y-1.5">
                  <Label htmlFor="regFakulti" className="font-bold text-xs text-[#002060]">Fakulti</Label>
                  <Select value={registerFakulti} onValueChange={setRegisterFakulti}>
                    <SelectTrigger id="regFakulti" className="text-xs h-10 focus:ring-[#002060]">
                      <SelectValue placeholder="Pilih Fakulti Tempat Bertugas" />
                    </SelectTrigger>
                    <SelectContent>
                      {["FKAAB", "FKEE", "FKMP", "FPTV", "FPTP", "FAST", "FSKTM", "FTK"].map((fac) => (
                        <SelectItem key={fac} value={fac} className="text-xs">{fac}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <nav className="flex gap-2 pt-2" aria-label="Navigasi Pendaftaran Kakitangan">
                  <Button
                    type="button"
                    onClick={handleExecuteRegistrationAction}
                    disabled={registerLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 cursor-pointer"
                  >
                    {registerLoading ? "Mendaftar..." : "Daftar Akaun"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs h-10 cursor-pointer border-[#002060] text-[#002060]"
                    disabled={registerLoading}
                    asChild
                  >
                    <Link href="/login">Batal</Link>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          ) : !isForgotMode ? (
            // This card renders the primary credential entry form with both UTHM logos in the header.
            <Card className="border border-border/80 shadow-2xl bg-white dark:bg-card/95 w-full">
              <CardHeader className="border-b border-border bg-muted/10 px-6 py-6 text-center space-y-4">

                {/* This row displays the UTHM shield logo and Zakat UTHM logo side-by-side at the top of the card. */}
                <div className="flex items-center justify-center gap-6 pb-2">
                  <Image
                    src="/image_bb5246.png"
                    alt="Logo Rasmi Universiti Tun Hussein Onn Malaysia (UTHM) Johor"
                    width={120}
                    height={40}
                    priority
                    className="h-12 w-auto object-contain"
                    style={{ width: "auto" }}
                  />
                  <Image
                    src="/image_bb546b.png"
                    alt="Logo Rasmi Unit Kutipan Zakat Pusat Islam UTHM"
                    width={90}
                    height={30}
                    priority
                    className="h-10 w-auto object-contain"
                    style={{ width: "auto" }}
                  />
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-[#002060]">
                    Log Masuk Portal
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Sila masukkan butiran kakitangan rasmi anda
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {error && (
                  // Incremental patch binding dynamic brute-force remaining count warnings directly onto the frontend portal access alert card.
                  <div className={`rounded-lg border p-3 text-xs font-semibold flex items-start gap-2 ${
                    error.includes("dikunci") || error.includes("Had cubaan")
                      ? "border-amber-400/50 bg-amber-50 text-amber-800"
                      : "border-destructive/30 bg-destructive/5 text-destructive"
                  }`}>
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="block">{error}</span>
                      {(error.includes("Baki cubaan") || error.includes("dikunci") || error.includes("Had cubaan")) && (
                        <span className="block text-[10px] font-medium opacity-75">Hubungi pentadbir sistem jika anda memerlukan bantuan segera.</span>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* This input captures the employee identifier used as the primary authentication credential. */}
                  <div className="space-y-1.5">
                    <Label htmlFor="noPekerja" className="font-bold text-xs text-[#002060]">
                      No. Pekerja atau No. Kad Pengenalan
                    </Label>
                    <Input
                      id="noPekerja"
                      type="text"
                      placeholder="Masukkan No. Pekerja / No. KP"
                      value={noPekerja}
                      onChange={(e) => setNoPekerja(e.target.value)}
                      className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-10"
                      disabled={loading}
                    />
                  </div>

                  {/* This input captures the secret password paired with the employee identifier above. */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="font-bold text-xs text-[#002060]">
                        Kata Laluan
                      </Label>
                      <nav aria-label="Navigasi Lupa Kata Laluan">
                        <Link
                          href="/login?mode=forgot"
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                        >
                          Lupa Kata Laluan?
                        </Link>
                      </nav>
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

                  {/* This button triggers credential verification and the subsequent root-path redirect on success. */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#002060] hover:bg-[#002060]/95 text-white font-bold text-xs rounded-xl transition-all duration-150 flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Mengesahkan Identiti...</span>
                      </>
                    ) : (
                      <span>LOG MASUK</span>
                    )}
                  </button>
                </form>

                {/* Incremental patch rendering a toggle link to access user registration workflows natively. */}
                <nav className="text-center pt-2" aria-label="Pilihan Akses Akaun">
                  <Link
                    href="/login?mode=register"
                    className="text-xs font-semibold text-[#002060] hover:underline cursor-pointer"
                  >
                    Kakitangan Baru? Daftar Akaun Portal Di Sini
                  </Link>
                </nav>
              </CardContent>
            </Card>
          ) : (
            // This card renders the password reset request form with the same dual-logo header.
            <Card className="border border-border/80 shadow-2xl bg-white dark:bg-card/95 w-full animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b border-border bg-muted/10 px-6 py-6 text-center space-y-4">

                {/* This row mirrors the dual-logo header inside the reset card for visual consistency. */}
                <div className="flex items-center justify-center gap-6 pb-2">
                  <Image
                    src="/image_bb5246.png"
                    alt="Logo Rasmi Universiti Tun Hussein Onn Malaysia (UTHM) Johor"
                    width={120}
                    height={40}
                    priority
                    className="h-12 w-auto object-contain"
                    style={{ width: "auto" }}
                  />
                  <Image
                    src="/image_bb546b.png"
                    alt="Logo Rasmi Unit Kutipan Zakat Pusat Islam UTHM"
                    width={90}
                    height={30}
                    priority
                    className="h-10 w-auto object-contain"
                    style={{ width: "auto" }}
                  />
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-[#002060]">
                    Set Semula Kata Laluan
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Sila masukkan butiran pengesahan kakitangan
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {forgotSuccess ? (
                  // This panel confirms that the reset request was accepted and shows the destination email.
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
                    <nav className="w-full" aria-label="Navigasi Pengesahan Set Semula">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full text-xs h-9 cursor-pointer"
                        asChild
                      >
                        <Link href="/login">Kembali Ke Log Masuk</Link>
                      </Button>
                    </nav>
                  </div>
                ) : (
                  // This form collects the employee number and institutional email for the reset workflow.
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    {forgotError && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    {/* This input accepts the employee number for identity verification during the reset flow. */}
                    <div className="space-y-1.5">
                      <Label htmlFor="forgotNoPekerja" className="font-bold text-xs text-[#002060]">
                        No. Pekerja
                      </Label>
                      <Input
                        id="forgotNoPekerja"
                        type="text"
                        placeholder="Contoh: STAFF001"
                        value={forgotNoPekerja}
                        onChange={(e) => setForgotNoPekerja(e.target.value)}
                        className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-10"
                      />
                    </div>

                    {/* This input accepts the UTHM institutional email address for sending the reset link. */}
                    <div className="space-y-1.5">
                      <Label htmlFor="forgotEmail" className="font-bold text-xs text-[#002060]">
                        Emel Rasmi UTHM
                      </Label>
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

                    <nav className="pt-1" aria-label="Kembali Ke Halaman Utama Log Masuk">
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Log Masuk
                      </Link>
                    </nav>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

// This wrapper reads the URL search parameters to supply a unique key based on mode, resetting form states automatically on mode transitions.
function LoginFormWrapper() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  return <LoginForm key={mode} />;
}

// This page export wraps the login form inside Suspense to allow useSearchParams without breaking static prerendering.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/40">
          <div className="text-xs font-bold text-[#002060] animate-pulse">Sila tunggu...</div>
        </div>
      }
    >
      <LoginFormWrapper />
    </Suspense>
  );
}
