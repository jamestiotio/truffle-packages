import React, { useEffect, useRef } from "https://npm.tfl.dev/react";
import jumper from "https://tfl.dev/@truffle/utils@~0.0.2/jumper/jumper.ts";
import Stylesheet from "https://tfl.dev/@truffle/ui@~0.0.3/components/stylesheet/stylesheet.tag.ts";
import Link from "https://tfl.dev/@truffle/router@^1.0.0/components/link/link.tag.ts";

import Counter from "../counter/counter.tsx";
import UserInfo from "../user-info/user-info.tsx";
import styleSheet from "./home.css" assert { type: "css" };

function ExtensionMapping() {
  // useStyleSheet(styleSheet);
  const ref = useRef();

  useEffect(() => {
    console.log("ref", ref.current);

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
    <div ref={ref}>
      {/* <Stylesheet url={new URL("./home.css", import.meta.url)} /> */}
      Hello world!
      <Counter initialCount={2} />
      <UserInfo />
      <Link href="/abc">My link</Link>
    </div>
  );
}

export default ExtensionMapping;
