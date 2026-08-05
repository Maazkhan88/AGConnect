import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db/client";
import { brands, brandThemes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { DEFAULT_THEME, parseSocialLinks } from "@/lib/brand";
import { BrandForm } from "../brand-form";
import { ThemeForm } from "../../themes/theme-form";

export default async function BrandDetailPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  await requireAdmin();
  const db = await getDb();
  const brand = await db.query.brands.findFirst({ where: eq(brands.id, brandId) });
  if (!brand) notFound();
  const theme = await db.query.brandThemes.findFirst({ where: eq(brandThemes.brandId, brandId) });

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Brand</p>
          <h1>{brand.displayName}</h1>
          <p className="muted">/p/&lt;slug&gt; profiles under this brand pick up its theme and logo automatically.</p>
        </div>
      </header>
      <h2>Details</h2>
      <BrandForm
        brand={{
          id: brand.id,
          displayName: brand.displayName,
          website: brand.website,
          whatsapp: brand.whatsapp,
          socials: parseSocialLinks(brand.socials),
        }}
      />
      <h2 style={{ marginTop: 32 }}>Theme</h2>
      <ThemeForm
        brandId={brand.id}
        themeId={theme?.id ?? null}
        values={theme ? { ...DEFAULT_THEME, ...JSON.parse(theme.values) } : DEFAULT_THEME}
      />
    </>
  );
}
