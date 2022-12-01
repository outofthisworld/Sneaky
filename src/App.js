import React from "react";

function useStateRef(initialValue) {
  const [state, setState] = React.useState(initialValue);
  const stateRef = React.useRef(state);

  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [stateRef, setState, state];
}

const ReactSlide = ({ children, onSlideOut }) => {
  const elRef = React.useRef(null);
  const [stateRef, setState] = useStateRef({ mousedown: false });

  React.useEffect(() => {
    stateRef.current.onSlideOut = onSlideOut;
  }, [onSlideOut, stateRef]);

  const mouseUpListener = React.useMemo(() => {
    return () => {
      if (elRef.current) {
        elRef.current.style.left = "0px";
      }
      setState({ ...stateRef.current, mousedown: false });
    };
  }, [stateRef, elRef, setState]);

  const mouseDownListener = React.useMemo(() => {
    return (e) => {
      setState({ ...stateRef.current, mousedown: true, x: e.clientX });
    };
  }, [stateRef, setState]);

  const mouseMoveListener = React.useMemo(
    () => (e) => {
      let passedThreshold = false;

      if (stateRef.current.mousedown && elRef.current) {
        const dx = (e.clientX - stateRef.current.x) * 0.65;
        if (dx > 0) {
          elRef.current.style.left = `${dx}px`;
          if (dx >= 200 && !passedThreshold) {
            passedThreshold = true;

            stateRef.current.onSlideOut();
            elRef.current.style.left = "0px";
            elRef.current.dispatchEvent(
              new MouseEvent("mouseup", {
                view: window,
                bubbles: true,
                cancelable: true
                /* whatever properties you want to give it */
              })
            );
          } else if (dx < 200) {
            passedThreshold = false;
          }
        }
      }
    },
    [stateRef, elRef]
  );

  const bindListeners = React.useCallback(
    (elRef) => {
      window.addEventListener("mouseup", mouseUpListener);
      elRef.current.addEventListener("mousedown", mouseDownListener);
      elRef.current.addEventListener("mousemove", mouseMoveListener);
    },
    [mouseDownListener, mouseUpListener, mouseMoveListener]
  );

  React.useEffect(() => {
    const elCopy = elRef;
    const elCurrent = elRef.current;
    if (elCopy && elCurrent) {
      bindListeners(elRef);
    }
    return () => {
      if (elCurrent) {
        elCurrent.removeEventListener("mousedown", mouseDownListener);
        elCurrent.removeEventListener("mousemove", mouseMoveListener);
      }
      window.removeEventListener("mouseup", mouseUpListener);
    };
  }, [
    elRef,
    bindListeners,
    mouseDownListener,
    mouseUpListener,
    mouseMoveListener
  ]);

  return (
    <div>
      <div
        ref={elRef}
        style={{
          position: "relative",
          left: 0,
          transition: "all 0.1s linear",
          overflow: "hidden"
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default function () {
  const [showDelete, setShowDelete] = React.useState(null);
  const [items, setItems] = React.useState([
    {
      name: "Dale"
    },
    {
      name: "Jitu"
    },
    {
      name: "Monty"
    },
    {
      name: "Joseph"
    },
    {
      name: "Luke"
    }
  ]);

  const removeItem = (index) => {
    const itemsCopy = [...items];
    const [deleted] = itemsCopy.splice(index, 1);
    itemsCopy[itemsCopy.length] = deleted;
    setShowDelete(false);
    setItems(itemsCopy);
  };

  return (
    <div style={{ position: "relative" }}>
      <div className="app">
        {items.map((item, index) => (
          <ReactSlide
            onSlideOut={() => setShowDelete({ index }) && false}
            key={index}
          >
            <div className="no-select item">{item.name}</div>
          </ReactSlide>
        ))}
      </div>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          zIndex: 999,
          minWidth: "300px",
          background: "rgb(152, 110, 187)",
          padding: 10,
          transform: "translate(-50%,-50%)",
          textAlign: "center",
          visibility: showDelete ? "visible" : "hidden",
          opacity: showDelete ? "1" : "0",
          transition: "all 0.2s linear"
        }}
      >
        <h1>Delete this item?</h1>
        <input
          type="button"
          value="Cancel"
          onClick={() => setShowDelete(false)}
        />{" "}
        <input
          type="button"
          value="Delete"
          onClick={() => removeItem(showDelete.index)}
        />
      </div>
    </div>
  );
}
