import { ZakatForm } from "@/components/zakat/ZakatForm";
import { Landmark } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ZakatPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 md:p-8 font-sans antialiased selection:bg-emerald-500/20">
      {/* Background radial highlight & subtle grid lines */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_80%,transparent_100%)]" />
      
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Main Administrative Card */}
        <Card className="border border-border/80 shadow-lg bg-card/95 backdrop-blur-[2px]">
          {/* Institutional Branding Header inside the card top */}
          <CardHeader className="border-b border-border bg-muted/20 px-6 py-8 flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-600 dark:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 ring-4 ring-emerald-500/10">
              <Landmark className="h-6 w-6" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                Sistem Caruman Zakat Gaji UTHM (Prototip)
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Borang Kebenaran Potongan Gaji Bulanan Kakitangan
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            <ZakatForm />
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
