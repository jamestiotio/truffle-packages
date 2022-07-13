import React, { useEffect } from "https://npm.tfl.dev/react";
import jumper from "https://tfl.dev/@truffle/utils@0.0.1/jumper/jumper.ts";
import Stylesheet from "https://tfl.dev/@truffle/ui@0.0.3/components/stylesheet/stylesheet.ts";
import { toDist } from "https://tfl.dev/@truffle/distribute@^1.0.0/format/wc/index.ts";
import ActivePoll from '../active-poll/active-poll.tsx'
import Counter from "../counter/counter.tsx";
// import UserInfo from "../user-info/user-info.tsx";
import Link from "https://tfl.dev/@truffle/router@1.0.0/components/link/link.tag.ts"

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
      <Stylesheet url={new URL("./home.css", import.meta.url)} />
      Hello world!
      <ActivePoll initialCount={2} />
      {/* <UserInfo /> */}
      <Link href="/abc">My link</Link>
    </>
  );
}

export default toDist('react', ExtensionMapping, import.meta.url)