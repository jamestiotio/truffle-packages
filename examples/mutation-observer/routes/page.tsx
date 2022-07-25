import React from "https://npm.tfl.dev/react";
import { toDist } from "https://tfl.dev/@truffle/distribute@^2.0.0/format/wc/react/index.ts";

import MutationObserver from "../components/mutation-observer/mutation-observer.tsx";

function HomePage() {
  return <MutationObserver />;
}

export default toDist(HomePage, import.meta.url);
