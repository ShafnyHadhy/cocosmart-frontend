import { useState } from "react";

export default function TestPage() {
  const [count, setCount] = useState(10);
  const [status, setStatus] = useState("online");

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-[500px] h-[500px] bg-amber-100 text-white flex flex-col justify-center items-center gap-10">
        <div className="flex justify-center items-center gap-8">
          <button
            onClick={() => {
              console.log("Decreasing...");
              setCount(count - 1);
            }}
            className="w-[100px] h-[40px] bg-accent rounded-lg"
          >
            -
          </button>
          <span className="text-5xl text-accent"> {count} </span>
          <button
            onClick={() => {
              console.log("Increasing...");
              setCount(count + 1);
            }}
            className="w-[100px] h-[40px] bg-accent rounded-lg"
          >
            +
          </button>
        </div>
        <div className="flex flex-col justify-center items-center">
          <span className="text-accent text-5xl mb-5">{status}</span>

          <div className="flex flex-row gap-[20px]">
            <button
              onClick={() => {
                setStatus("online");
              }}
              className="w-[100px] bg-accent h-[40px] rounded-lg"
            >
              online
            </button>
            <button
              onClick={() => {
                setStatus("offline");
              }}
              className="w-[100px] bg-accent h-[40px] rounded-lg"
            >
              offline
            </button>
            <button
              onClick={() => {
                setStatus("deactivated");
              }}
              className="w-[100px] bg-accent h-[40px] rounded-lg"
            >
              deactivated
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
