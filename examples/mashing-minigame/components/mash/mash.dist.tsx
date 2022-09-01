import React, { useEffect } from "https://npm.tfl.dev/react";
import jumper from "https://tfl.dev/@truffle/utils@0.0.1/jumper/jumper.ts";
import { toDist } from "https://tfl.dev/@truffle/distribute@^2.0.5/format/wc/react/index.ts";
import ActivePoll from "../active-poll/active-poll.tsx";

function ExtensionMapping() {
  useEffect(() => {
    const style = {
      width: "400px",
      height: "400px",
      background: "#fff",
      position: "fixed",
      bottom: 0,
      "z-index": "999",
    };
    // set styles for this iframe within YouTube's site
    jumper.call("layout.applyLayoutConfigSteps", {
      layoutConfigSteps: [
        { action: "useSubject" }, // start with our iframe
        { action: "setStyle", value: style },
      ],
    });
  }, []);

  return (
    <>
      <ActivePoll initialCount={2} />
    </>
  );
}

export default toDist(ExtensionMapping, import.meta.url);
