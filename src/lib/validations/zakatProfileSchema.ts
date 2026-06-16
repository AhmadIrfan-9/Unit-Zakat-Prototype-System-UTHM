// This Zod schema enforces strict data types and mandatory Akta 709 validation for all profile update submissions.

import { z } from "zod";

// This object defines the strict validation criteria for the staff profile fields.
export const zakatProfileSchema = z.object({
  // The full name validation constraint.
  namaPenuh: z.string().min(3, { message: "Nama penuh mestilah mengandungi sekurang-kurangnya 3 abjad." }),

  // The identity card number constraint.
  noKP: z.string().length(12, { message: "No. Kad Pengenalan mestilah tepat 12 digit tanpa sempang." }),

  // The numeric age constraint.
  umur: z.coerce.number().int().min(18, { message: "Umur minimum bagi kakitangan ialah 18 tahun." }),

  // The mobile phone number format constraint.
  noTelefon: z.string().regex(/^01[0-9]-?[0-9]{7,8}$/, { message: "Format nombor telefon tidak sah (cth: 012-3456789)." }),

  // The staff code validation constraint.
  noPekerja: z.string().min(3, { message: "No. Pekerja mestilah sekurang-kurangnya 3 aksara." }),

  // The positive monetary salary constraint.
  gajiSemasa: z.coerce.number().positive({ message: "Gaji semasa mestilah bernilai positif." }),

  // The physical state selection constraint.
  negeri: z.string().min(1, { message: "Sila pilih negeri kediaman." }),

  // The local city validation constraint.
  bandar: z.string().min(1, { message: "Sila nyatakan bandar." }),

  // The five-digit postal code constraint.
  poskod: z.string().length(5, { message: "Poskod mestilah tepat 5 digit." }),

  // The detailed home address constraint.
  alamatRumah: z.string().min(10, { message: "Sila masukkan alamat rumah yang lengkap." }),

  // The Akta 709 compliance consent constraint.
  persetujuanAkta709: z.boolean().refine((val) => val === true, {
    message: "Anda mestilah bersetuju dengan pengesahan Akta 709.",
  }),
});

export type ZakatProfileInput = z.infer<typeof zakatProfileSchema>;
