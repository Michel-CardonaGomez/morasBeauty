  export const formatearHora = (hora) => {
    const [h, m] = hora.split(":").map(Number);
    const periodo = h >= 12 ? "pm" : "am";
    const h12 = h % 12 || 12;
    return m === 0
      ? `${h12} ${periodo}`
      : `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
  };