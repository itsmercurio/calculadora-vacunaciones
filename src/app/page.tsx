"use client";

import { useState } from "react";

const LAST_CALCULATION_KEY = "calculadora-vacunaciones:last-calculation";

type MedicationType = "vacuna" | "antibiotico" | "especial";
type RiskLevel = "verde" | "amarillo" | "rojo";
type AppTab = "calculadora" | "informacion" | "info-medicamento";

type MedicationCard = {
  nombre: string;
  tipo: MedicationType;
  permiteSuero: boolean;
  dosisPorPeso: boolean;
  tamanos: number[];
  advertencia?: string;
  recomendaciones: string[];
  nivelRiesgo: RiskLevel;
  usoPrincipal: string;
  enfermedades: string[];
  cuandoSeUsa: string;
  notasCampo: string[];
};

type CalculationResult = {
  mlPorCerdo: number;
  totalMl: number;
  cerdosPorBote: number;
  botesNecesarios: number;
  tamanoBotePrincipal: number;
  autonomiaMochilaCerdos: number;
  botesRecomendadosParaCargar: number;
  bottleCounts: Array<{ size: number; pigsPerBottle: number; count: number }>;
};

type LastCalculation = {
  timestamp: string;
  medicationName: string;
  numberOfBooths: string;
  indicatedCm: string;
  result: CalculationResult;
};

const MEDICATION_CARDS: Record<string, MedicationCard> = {
  manual: {
    nombre: "Manual",
    tipo: "especial",
    permiteSuero: true,
    dosisPorPeso: false,
    tamanos: [50, 100, 200, 250],
    nivelRiesgo: "amarillo",
    recomendaciones: ["Introducir cm segun indicacion de tratamiento."],
    usoPrincipal: "Calculo general de tratamiento en campo.",
    enfermedades: ["Depende del tratamiento real aplicado"],
    cuandoSeUsa: "Cuando se necesita un calculo rapido sin plantilla fija.",
    notasCampo: ["Comprobar siempre etiqueta y pauta veterinaria."],
  },
  auskipra: {
    nombre: "Auskipra",
    tipo: "vacuna",
    permiteSuero: false,
    dosisPorPeso: false,
    tamanos: [],
    nivelRiesgo: "verde",
    recomendaciones: [
      "Vacuna preventiva",
      "No tratar enfermedad activa",
      "Mantener cadena de frio",
      "No mezclar con otros productos",
    ],
    usoPrincipal: "Prevencion de la enfermedad de Aujeszky.",
    enfermedades: ["Aujeszky (pseudorrabia porcina)"],
    cuandoSeUsa: "Planes vacunales en reproductoras y cebo segun explotacion.",
    notasCampo: [
      "Vacuna preventiva",
      "No tratar enfermedad activa",
      "Mantener cadena de frio",
      "No mezclar con otros productos",
    ],
  },
  circoflex: {
    nombre: "Circoflex",
    tipo: "vacuna",
    permiteSuero: false,
    dosisPorPeso: false,
    tamanos: [],
    nivelRiesgo: "verde",
    recomendaciones: [
      "Muy comun en porcino",
      "Aplicacion preventiva",
      "No mezclar con otros productos",
    ],
    usoPrincipal: "Prevencion del circovirus porcino tipo 2 (PCV2).",
    enfermedades: ["Circovirus porcino (fallo de crecimiento, inmunosupresion)"],
    cuandoSeUsa: "Lechones en fases tempranas (programas vacunales).",
    notasCampo: [
      "Muy comun en porcino",
      "Aplicacion preventiva",
      "No mezclar con otros productos",
    ],
  },
  circomax: {
    nombre: "Circomax",
    tipo: "vacuna",
    permiteSuero: false,
    dosisPorPeso: false,
    tamanos: [],
    nivelRiesgo: "verde",
    recomendaciones: ["Uso preventivo", "Parte de programas vacunales"],
    usoPrincipal: "Prevencion del circovirus porcino.",
    enfermedades: ["PCV2"],
    cuandoSeUsa: "Alternativa a Circoflex segun plan sanitario.",
    notasCampo: ["Uso preventivo", "Parte de programas vacunales"],
  },
  draxin: {
    nombre: "Draxxin",
    tipo: "antibiotico",
    permiteSuero: true,
    dosisPorPeso: true,
    tamanos: [50],
    nivelRiesgo: "amarillo",
    recomendaciones: [
      "Dosis por peso",
      "No agitar",
      "Uso responsable antibioticos",
      "Uso frecuente en campo",
    ],
    usoPrincipal: "Infecciones respiratorias en porcino.",
    enfermedades: ["Neumonia bacteriana", "Complejo respiratorio porcino"],
    cuandoSeUsa: "Brotes respiratorios y tratamiento individual o metafilaxis.",
    notasCampo: [
      "Dosis por peso",
      "No agitar",
      "Uso responsable antibioticos",
      "Uso frecuente en campo",
    ],
  },
  cenflox: {
    nombre: "Cenflox",
    tipo: "antibiotico",
    permiteSuero: true,
    dosisPorPeso: true,
    tamanos: [100, 250],
    nivelRiesgo: "rojo",
    recomendaciones: [
      "Dosis por peso",
      "Evitar subdosificacion (resistencias)",
      "Uso controlado",
    ],
    usoPrincipal: "Infecciones bacterianas sistemicas y respiratorias.",
    enfermedades: ["Neumonias", "Infecciones digestivas/bacterianas"],
    cuandoSeUsa: "Casos respiratorios moderados a graves.",
    notasCampo: [
      "Dosis por peso",
      "Evitar subdosificacion (resistencias)",
      "Uso controlado",
    ],
  },
  marbocen: {
    nombre: "Marbocen",
    tipo: "antibiotico",
    permiteSuero: false,
    dosisPorPeso: true,
    tamanos: [250],
    nivelRiesgo: "amarillo",
    recomendaciones: ["Dosis por peso", "Uso responsable", "Muy comun en porcino"],
    usoPrincipal: "Infecciones respiratorias y sistemicas.",
    enfermedades: ["Neumonia", "MMA (metritis-mastitis-agalactia en hembras)"],
    cuandoSeUsa: "Tratamientos individuales o brotes.",
    notasCampo: ["Dosis por peso", "Uso responsable", "Muy comun en porcino"],
  },
  tulavis: {
    nombre: "Tulavis",
    tipo: "antibiotico",
    permiteSuero: false,
    dosisPorPeso: true,
    tamanos: [100, 250],
    nivelRiesgo: "amarillo",
    recomendaciones: ["Uso veterinario controlado", "Dosis por peso"],
    usoPrincipal: "Enfermedad respiratoria porcina.",
    enfermedades: ["Neumonia bacteriana"],
    cuandoSeUsa: "Brotes respiratorios.",
    notasCampo: ["Uso veterinario controlado", "Dosis por peso"],
  },
  selectan: {
    nombre: "Selectan",
    tipo: "especial",
    permiteSuero: false,
    dosisPorPeso: true,
    tamanos: [250],
    advertencia: "NO MEZCLAR CON NADA",
    nivelRiesgo: "rojo",
    recomendaciones: [
      "No mezclar con otros productos",
      "Puede ser viscoso",
      "Vaciar completamente la pistola tras uso",
      "Limpieza muy cuidadosa del material",
      "Uso responsable antibioticos",
    ],
    usoPrincipal: "Infecciones bacterianas respiratorias.",
    enfermedades: ["Neumonia bacteriana"],
    cuandoSeUsa: "Casos graves o especificos.",
    notasCampo: [
      "NO mezclar con otros productos",
      "Puede ser viscoso",
      "Vaciar completamente la pistola tras uso",
      "Limpieza muy cuidadosa del material",
      "Uso responsable antibioticos",
    ],
  },
  qivitan: {
    nombre: "Qivitan",
    tipo: "antibiotico",
    permiteSuero: false,
    dosisPorPeso: true,
    tamanos: [250],
    nivelRiesgo: "rojo",
    recomendaciones: [
      "Dosis por peso",
      "Riesgo de resistencias antimicrobianas",
      "Uso responsable obligatorio",
    ],
    usoPrincipal: "Infecciones bacterianas.",
    enfermedades: ["Bacterianas (uso general veterinario)"],
    cuandoSeUsa: "Tratamientos bajo control veterinario.",
    notasCampo: [
      "Dosis por peso",
      "Riesgo de resistencias antimicrobianas",
      "Uso responsable obligatorio",
    ],
  },
};

const MEDICATION_OPTIONS = Object.entries(MEDICATION_CARDS).map(([value, ficha]) => ({
  value,
  label: ficha.nombre,
}));

function getMedicationCardByName(name: string): MedicationCard | null {
  return MEDICATION_CARDS[name] ?? null;
}

function getInitialLastCalculation(): LastCalculation | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LAST_CALCULATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastCalculation;
  } catch {
    window.localStorage.removeItem(LAST_CALCULATION_KEY);
    return null;
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("calculadora");
  const [initial] = useState<LastCalculation | null>(() => getInitialLastCalculation());
  const [numberOfBooths, setNumberOfBooths] = useState(initial?.numberOfBooths ?? "");
  const [indicatedCm, setIndicatedCm] = useState(initial?.indicatedCm ?? "");
  const [medicationName, setMedicationName] = useState(initial?.medicationName ?? "");
  const [result, setResult] = useState<CalculationResult | null>(initial?.result ?? null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const selectedMedicationCard = getMedicationCardByName(medicationName);

  const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorText(null);

    if (!numberOfBooths || !indicatedCm || !medicationName || !selectedMedicationCard) {
      setErrorText("Completa todos los campos.");
      return;
    }

    const plazas = Number(numberOfBooths);
    const cmIndicados = Number(indicatedCm);
    if (plazas <= 0 || cmIndicados <= 0) {
      setErrorText("Introduce valores validos y mayores que cero.");
      return;
    }

    // Nueva regla: 1 cm = 1 ml
    const mlPorCerdo = cmIndicados;
    const totalMl = plazas * mlPorCerdo;
    const availableSizes =
      selectedMedicationCard.tamanos.length > 0 ? selectedMedicationCard.tamanos : [250];
    const tamanoBotePrincipal = availableSizes[0];
    const cerdosPorBote = tamanoBotePrincipal / cmIndicados;
    const botesNecesarios = Math.ceil(plazas / cerdosPorBote);

    const bottleCounts = availableSizes.map((size) => {
      const pigsPerBottle = size / cmIndicados;
      return {
        size,
        pigsPerBottle,
        count: Math.ceil(plazas / pigsPerBottle),
      };
    });
    const autonomiaMochilaCerdos = 2500 / cmIndicados;
    const botesRecomendadosParaCargar = Math.ceil(2500 / tamanoBotePrincipal);

    const nextResult: CalculationResult = {
      mlPorCerdo,
      totalMl,
      cerdosPorBote,
      botesNecesarios,
      tamanoBotePrincipal,
      autonomiaMochilaCerdos,
      botesRecomendadosParaCargar,
      bottleCounts,
    };
    setResult(nextResult);

    const payload: LastCalculation = {
      timestamp: new Date().toISOString(),
      medicationName,
      numberOfBooths,
      indicatedCm,
      result: nextResult,
    };
    window.localStorage.setItem(LAST_CALCULATION_KEY, JSON.stringify(payload));
  };

  const handleClear = () => {
    setNumberOfBooths("");
    setIndicatedCm("");
    setMedicationName("");
    setResult(null);
    setErrorText(null);
    window.localStorage.removeItem(LAST_CALCULATION_KEY);
  };

  const riskText =
    selectedMedicationCard?.nivelRiesgo === "rojo"
      ? "Rojo: medicamento critico. Requiere maxima atencion."
      : selectedMedicationCard?.nivelRiesgo === "amarillo"
        ? "Amarillo: requiere precaucion en la aplicacion y el manejo."
        : selectedMedicationCard
          ? "Verde: uso normal en campo."
          : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-start justify-center px-4 py-6">
      <section className="w-full rounded-3xl border border-white/50 bg-white/90 p-5 shadow-xl shadow-sky-100/70">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
          Calculadora de Vacunaciones
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Flujo real en campo: plazas + cm indicados + medicamento.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("calculadora")}
            className={`h-11 rounded-xl text-sm font-semibold ${activeTab === "calculadora" ? "bg-white text-slate-900 shadow" : "text-slate-600"}`}
          >
            Calculadora
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("informacion")}
            className={`h-11 rounded-xl text-sm font-semibold ${activeTab === "informacion" ? "bg-white text-slate-900 shadow" : "text-slate-600"}`}
          >
            Informacion
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("info-medicamento")}
            className={`col-span-2 h-11 rounded-xl text-sm font-semibold ${activeTab === "info-medicamento" ? "bg-white text-slate-900 shadow" : "text-slate-600"}`}
          >
            Informacion del medicamento
          </button>
        </div>

        {activeTab === "calculadora" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <form className="space-y-4" onSubmit={handleCalculate}>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Numero de plazas</span>
                <input
                  type="number"
                  min={1}
                  required
                  value={numberOfBooths}
                  onChange={(e) => setNumberOfBooths(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Centimetros a aplicar (pistola)</span>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  required
                  value={indicatedCm}
                  onChange={(e) => setIndicatedCm(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Medicamento</span>
                <select
                  required
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Selecciona un medicamento</option>
                  {MEDICATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {selectedMedicationCard?.advertencia && (
                <p className="rounded-xl border-2 border-rose-500 bg-rose-100 px-4 py-3 text-center text-base font-extrabold text-rose-800">
                  ALERTA: {selectedMedicationCard.advertencia}
                </p>
              )}

              {riskText && (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">{riskText}</p>
              )}

              {selectedMedicationCard && (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                  Suero: {selectedMedicationCard.permiteSuero ? "permitido segun criterio" : "no permitido"}
                </p>
              )}

              {errorText && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{errorText}</p>
              )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="submit" className="h-16 rounded-2xl bg-sky-600 text-xl font-semibold text-white hover:bg-sky-700">
                  Calcular
                </button>
                <button type="button" onClick={handleClear} className="h-16 rounded-2xl border border-slate-300 bg-white text-lg font-semibold text-slate-700">
                  Limpiar
                </button>
              </div>

              {result && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">Resultado final</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <article className="rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-500">ml por cerdo</p>
                        <p className="text-lg font-semibold text-slate-900">{result.mlPorCerdo.toFixed(2)}</p>
                      </article>
                      <article className="rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-500">cerdos por bote</p>
                        <p className="text-lg font-semibold text-slate-900">{result.cerdosPorBote.toFixed(2)}</p>
                      </article>
                      <article className="rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-500">botes necesarios</p>
                        <p className="text-lg font-semibold text-slate-900">{result.botesNecesarios}</p>
                      </article>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Referencia principal: bote de {result.tamanoBotePrincipal} ml.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">Total ml calculado: {result.totalMl.toFixed(2)} ml.</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Autonomia de mochila (2.5L): {result.autonomiaMochilaCerdos.toFixed(2)} cerdos.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Botes recomendados para cargar: {result.botesRecomendadosParaCargar}.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">Botes necesarios por tamano</p>
                    {result.bottleCounts.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-600">Segun formato comercial del producto.</p>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {result.bottleCounts.map((item) => (
                          <article key={item.size} className="rounded-xl bg-white p-3 text-center">
                            <p className="text-xs text-slate-500">{item.size} ml</p>
                            <p className="text-[11px] text-slate-500">{item.pigsPerBottle.toFixed(2)} cerdos/bote</p>
                            <p className="text-xl font-semibold text-slate-900">{item.count}</p>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>

            {selectedMedicationCard && (
              <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">Ficha del medicamento</p>
                <p className="mt-1 text-sm text-slate-700">Nombre: <strong>{selectedMedicationCard.nombre}</strong></p>
                <p className="mt-1 text-sm text-slate-700">Tipo: <strong>{selectedMedicationCard.tipo}</strong></p>
                <p className="mt-1 text-sm text-slate-700">Nivel de riesgo: <strong>{selectedMedicationCard.nivelRiesgo}</strong></p>
                <p className="mt-1 text-sm text-slate-700">Permite suero: <strong>{selectedMedicationCard.permiteSuero ? "si" : "no"}</strong></p>
                <p className="mt-2 text-sm font-medium text-slate-800">Recomendaciones:</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
                  {selectedMedicationCard.recomendaciones.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        )}

        {activeTab === "informacion" && (
          <div className="mt-6 space-y-3">
            {Object.entries(MEDICATION_CARDS)
              .filter(([key]) => key !== "manual")
              .map(([key, ficha]) => (
                <article key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-base font-semibold text-slate-900">{ficha.nombre}</p>
                  <p className="mt-1 text-sm text-slate-700">Tipo: {ficha.tipo} | Riesgo: {ficha.nivelRiesgo}</p>
                  <p className="mt-1 text-sm text-slate-700">Botes: {ficha.tamanos.length ? `${ficha.tamanos.join(", ")} ml` : "segun dosis comerciales"}</p>
                </article>
              ))}
          </div>
        )}

        {activeTab === "info-medicamento" && (
          <div className="mt-6">
            {!selectedMedicationCard ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Selecciona un medicamento en la pestana Calculadora para ver informacion.
              </p>
            ) : (
              <article className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-base font-semibold text-slate-900">{selectedMedicationCard.nombre}</p>
                <p className="text-sm text-slate-700"><strong>Uso principal:</strong> {selectedMedicationCard.usoPrincipal}</p>
                <p className="text-sm text-slate-700"><strong>Enfermedades:</strong> {selectedMedicationCard.enfermedades.join(", ")}</p>
                <p className="text-sm text-slate-700"><strong>Cuando se usa:</strong> {selectedMedicationCard.cuandoSeUsa}</p>
                <div className="text-sm text-slate-700">
                  <strong>Notas:</strong>
                  <ul className="mt-1 list-disc pl-5">
                    {selectedMedicationCard.notasCampo.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              </article>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
