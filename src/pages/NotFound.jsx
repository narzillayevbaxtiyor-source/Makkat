import React from "react";
import { useNavigate } from "react-router-dom";
import { Btn } from "../components/ui.jsx";

export default function NotFound({ t }) {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAF8F2] flex flex-col items-center justify-center px-6">
      <p className="text-[20px] font-semibold text-[#221F17] mb-4">{t.notFound}</p>
      <Btn className="max-w-xs" onClick={() => nav("/")}>{t.goHome}</Btn>
    </div>
  );
}
