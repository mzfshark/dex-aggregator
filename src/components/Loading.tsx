// components/Loading.tsx
import Spinner from "react-bootstrap/Spinner";
import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="text-center my-5">
      <Spinner animation="grow" />
      <p className="my-2">Loading Data...</p>
    </div>
  );
};

export default Loading;