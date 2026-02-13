import React from "react";
import ReactMarkdown from "react-markdown";

function SummeryBox({ summery }) {
  return (
    <div>
      <ReactMarkdown>{summery}</ReactMarkdown>
    </div>
  );
}

export default SummeryBox;
