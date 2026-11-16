import { DocShell } from "@/docs/components/doc-shell"
import { CatalogPage } from "@/docs/pages/catalog-page"
import { NotFoundPage, pageFor } from "@/docs/pages"
import { SetupPage } from "@/docs/pages/setup-page"
import { useRoute } from "@/docs/use-route"

function Page({ route }: { route: string }) {
  if (route === "") return <CatalogPage />
  if (route === "setup") return <SetupPage />
  return pageFor(route) ?? <NotFoundPage />
}

export function App() {
  const route = useRoute()

  return (
    <DocShell route={route}>
      <Page route={route} />
    </DocShell>
  )
}

export default App
