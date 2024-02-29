import { useState, useEffect, useRef } from "react";

import "./App.css";
export const AutoScrollContainer = ({ items }) => {
  const bottomRef = useRef();
  const containerRef = useRef();
  const [isNearBottom, setIsNearBottom] = useState(true);
  const handleScroll = () => {
    const container = containerRef.current;

    const isNearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10;
    console.log(isNearBottom);
    setIsNearBottom(isNearBottom);
  };
  const scrollToBottom = () => {
    bottomRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [items]);

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [items, isNearBottom]);

  useEffect(() => {
    scrollToBottom();
  }, []);
  return (
    <div
      className="autoscroll-container"
      ref={containerRef}
      onScroll={handleScroll}
    >
      <button type="button" onClick={scrollToBottom}>
        Scroll To Bottom
      </button>
      <div className="scroll-list">
        {items &&
          items.map((item, index) => (
            <p key={index}>{`${index + 1}. ${item}`}</p>
          ))}
        <div ref={bottomRef} className="list-bottom"></div>
      </div>
    </div>
  );
};

const App = () => {
  const [messages, setMessages] = useState(["Start"]);
  const [play, setPlay] = useState(true);
  const [source, setSource] = useState(
    null
  );

  const handlePlay = () => {
    setSource(new EventSource(`http://127.0.0.1:5000/listen`));
    setPlay(true);
  };
  const handleStop = () => {
    source?.close();
    setSource(null);
    setPlay(false);
  };
  
  useEffect(() => {
    const source = new EventSource(`http://127.0.0.1:5000/listen`);
    setSource(source);

    

    return () => {
      source?.close();
    };
  }, []);

  useEffect(() => {
    source?.addEventListener("open", () => {
      console.log("SSE opened!");
    });

    source?.addEventListener("message", (e) => {
      const data = e.data.split("\n");
      console.log(data);
      setMessages((prevMessages) => [...prevMessages, ...data]);
    });

    source?.addEventListener("error", (e) => {
      console.error("Error: ", e);
    });
  }, [source]);

  return (
    <div>
      <h1>Server Sent Events</h1>
      <div>
        <AutoScrollContainer items={messages} />
        <button onClick={play ? handleStop : handlePlay}>{play ? "Pause" : "Play"}</button>
        
      </div>
    </div>
  );
};

export default App;
