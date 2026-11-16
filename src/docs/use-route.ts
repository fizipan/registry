import * as React from "react"

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

/** The current hash route without its "#/" prefix: "" for the catalog, "time-picker" for a part. */
function readRoute() {
  return window.location.hash.replace(/^#\/?/, "").split(/[?#]/)[0]
}

export function useRoute() {
  const route = React.useSyncExternalStore(subscribe, readRoute, () => "")

  React.useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route])

  return route
}

export function href(route: string) {
  return route ? `#/${route}` : "#/"
}
