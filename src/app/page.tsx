import { ZakatSalaryDeductionFormClientComponent } from "@/components/zakat/zakat-salary-deduction-form-client-component";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";

export default function ZakatPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 md:p-8 font-sans antialiased selection:bg-emerald-500/20">
      {/* Background radial highlight & subtle grid lines */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_80%,transparent_100%)]" />
      
      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        
        {/* Institutional UTHM Logo at the very top of the website */}
        <div className="flex justify-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
          <Image
            src="/logo.png"
            alt="Logo UTHM"
            width={240}
            height={100}
            priority
            className="h-24 w-auto object-contain"
          />
        </div>

        {/* Main Administrative Card */}
        <Card className="border border-border/80 shadow-lg bg-card/95 backdrop-blur-[2px] w-full">
          {/* Institutional Branding Header inside the card top */}
          <CardHeader className="border-b border-border bg-muted/20 px-6 py-8 flex flex-col items-center text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Sistem Caruman Zakat Gaji UTHM (Prototip)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Borang Kebenaran Potongan Gaji Bulanan Kakitangan
            </p>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            <ZakatSalaryDeductionFormClientComponent />
          </CardContent>
        </Card>

        {/* Footer */}
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
