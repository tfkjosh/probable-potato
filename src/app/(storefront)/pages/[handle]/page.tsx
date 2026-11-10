
import { notFound } from "next/navigation";
import { getPage } from "@/lib/shopify/actions/get-page";

interface PageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function CMSPage({
  params,
}: PageProps) {
  const { handle } = await params;

  const page = await getPage(handle);

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-8 text-4xl font-bold">
        {page.title}
      </h1>

      <article
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{
          __html: page.body,
        }}
      />
    </main>
  );
}
