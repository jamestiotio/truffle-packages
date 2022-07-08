import React from "https://npm.tfl.dev/react";
import { useParams } from "https://tfl.dev/@truffle/utils@0.0.1/router/router.js";
import { toDist } from "https://tfl.dev/@truffle/distribute@1.0.0/format/wc/index.js";

function MyVarPage() {
  const params = useParams();

  return (
    <div>
      Page with variable route: {JSON.stringify(params)}
    </div>
  );
}

export default toDist('react', MyVarPage, import.meta.url)