// src/app/page.tsx
import { ZakatSalaryDeductionFormClientComponent } from "@/components/zakat/ZakatSalaryDeductionFormClientComponent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";

export default function ZakatPage() {
  return (
    // This container sets a professional administrative background pattern centered on the page viewport.
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 md:p-8 font-sans antialiased selection:bg-emerald-500/20">
      
      {/* This structural block creates a subtle layout grid pattern across the page background. */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(0,32,96,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,32,96,0.02)_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_80%,transparent_100%)]" />
      
      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        
        {/* This block renders the institutional UTHM logo image at the top of the portal. */}
        <div className="flex justify-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
          <Image
            src="/logo.png"
            alt="Logo UTHM"
            width={280}
            height={80}
            priority
            className="h-20 w-auto object-contain mix-blend-multiply dark:mix-blend-normal"
          />
        </div>

        {/* This main card acts as the primary layout containment wrapper for the zakat application form. */}
        <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 w-full">
          
          {/* This branding header specifies the authority details of the administrative system. */}
          <CardHeader className="border-b border-border bg-muted/10 px-6 py-8 flex flex-col items-center text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#002060]">
              Sistem Caruman Zakat Gaji UTHM
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Borang Kebenaran Potongan Gaji Bulanan Kakitangan
            </p>
          </CardHeader>
          
          {/* This content segment hosts the interactive client wizard deduction form elements. */}
          <CardContent className="p-6 md:p-8">
            <ZakatSalaryDeductionFormClientComponent />
          </CardContent>
        </Card>

        {/* This footer block displays copyright information and official university credits. */}
        <footer className="text-center space-y-1">
          <p className="text-[11px] text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Universiti Tun Hussein Onn Malaysia. Hak Cipta Terpelihara.
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            Disediakan oleh Pejabat Zakat UTHM & Bahagian Teknologi Maklumat
          </p>
        </footer>
      </div>
    </div>
  );
}
