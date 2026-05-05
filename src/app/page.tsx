"use client";

import { useState } from "react";

const DECIMAL_PRECISION = 6;
const LAST_CALCULATION_KEY = "calculadora-vacunaciones:last-calculation";

type MedicationType = "vacuna" | "antibiotico" | "especial";
type RiskLevel = "verde" | "amarillo" | "rojo";

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

const MEDICATION_CARDS = {
  manual: {
    nombre: "Manual",
    tipo: "especial",
    permiteSuero: true,
    dosisPorPeso: false,
    tamanos: [50, 100, 200, 250],
    recomendaciones: ["Introducir dosis manual segun criterio tecnico."],
    nivelRiesgo: "amarillo",
    usoPrincipal: "Calculo manual de dosis cuando no hay ficha especifica.",
    enfermedades: ["Depende del medicamento real aplicado"],
    cuandoSeUsa: "Cuando se necesita un calculo rapido sin plantilla cerrada.",
    notasCampo: ["Revisar etiqueta del producto antes de preparar la mezcla."],
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
      "Dosis segun peso",
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
      "Dosis segun peso",
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
    recomendaciones: [
      "Dosis segun peso",
      "Uso responsable",
      "Muy comun en porcino",
    ],
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
    recomendaciones: [
      "No mezclar con otros productos",
      "Puede ser viscoso",
      "Vaciar completamente la pistola tras uso",
      "Limpieza muy cuidadosa del material",
      "Uso responsable antibioticos",
    ],
    nivelRiesgo: "rojo",
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
      "Riesgo de resistencia antimicrobiana",
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
} satisfies Record<string, MedicationCard>;

const FIXED_DOSES: Partial<Record<MedicationKey, number>> = {
  auskipra: 2,
};

const MEDICATION_OPTIONS = Object.entries(MEDICATION_CARDS).map(([value, ficha]) => ({
  value,
  label: ficha.nombre,
}));

type CalculationResult = {
  dosePerPig: number;
  gunValuePerPig: number;
  salinePerPig: number;
  dividedDoseMode: boolean;
  shotsPerPig: number;
  shotOptions: number[][];
  medicationTotal: number;
  salineTotal: number;
  appliedVolumeTotal: number;
  bottles250: number;
  bottles200: number;
  bottles100: number;
  bottles50: number;
};

type LastCalculation = {
  timestamp: string;
  medicationName: string;
  numberOfBooths: string;
  indicatedDoseMl: string;
  gunSizeMl: string;
  useSaline: boolean;
  splitMode?: "auto" | "manual";
  selectedShotOption?: number;
  manualShotValues?: string[];
  result: CalculationResult;
};

type MedicationKey = keyof typeof MEDICATION_CARDS;
type AppTab = "calculadora" | "informacion" | "info-medicamento";

function roundValue(value: number, precision = DECIMAL_PRECISION) {
  return Number(value.toFixed(precision));
}

function safeCeilDivision(total: number, size: number) {
  return Math.ceil(total / size - 1e-9);
}

function getMedicationCardByName(name: string): MedicationCard | null {
  if (!name) return null;
  return (MEDICATION_CARDS[name as MedicationKey] as MedicationCard | undefined) ?? null;
}

function getBottleSizesForMedication(name: string): number[] {
  const ficha = getMedicationCardByName(name);
  if (!ficha) return [];
  if (ficha.tipo === "vacuna") return [];
  return [...ficha.tamanos].sort((a, b) => b - a);
}

function getInitialLastCalculation(): LastCalculation | null {
  if (typeof window === "undefined") return null;

  const savedCalculation = window.localStorage.getItem(LAST_CALCULATION_KEY);
  if (!savedCalculation) return null;

  try {
    return JSON.parse(savedCalculation) as LastCalculation;
  } catch {
    window.localStorage.removeItem(LAST_CALCULATION_KEY);
    return null;
  }
}

function generateShotCombinations(totalDose: number, maxPerShot: number, shots: number) {
  const results: number[][] = [];
  const target = Math.round(totalDose * 10);
  const maxValue = Math.round(maxPerShot * 10);

  if (target <= 0 || maxValue <= 0 || shots < 2) return results;

  const build = (remaining: number, remainingShots: number, current: number[]) => {
    if (results.length >= 40) return;
    if (remainingShots === 0) {
      if (remaining === 0) results.push([...current].map((part) => part / 10));
      return;
    }

    const minNeeded = remainingShots - 1;
    const minValue = 1;
    const maxPossible = Math.min(maxValue, remaining - minNeeded);

    for (let value = minValue; value <= maxPossible; value++) {
      current.push(value);
      build(remaining - value, remainingShots - 1, current);
      current.pop();
    }
  };

  build(target, shots, []);
  return results;
}

function getOptimalShotOptionIndex(options: number[][]) {
  if (options.length === 0) return 0;

  let bestIndex = 0;
  let bestScore = Number.POSITIVE_INFINITY;

  options.forEach((option, index) => {
    const max = Math.max(...option);
    const min = Math.min(...option);
    const spread = max - min;
    const variancePenalty = option.reduce((acc, value) => acc + Math.abs(value - min), 0);
    const score = spread * 1000 + variancePenalty;

    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export default function Home() {
  const [initialCalculation] = useState<LastCalculation | null>(() =>
    getInitialLastCalculation(),
  );
  const [numberOfBooths, setNumberOfBooths] = useState(
    initialCalculation?.numberOfBooths ?? "",
  );
  const [medicationName, setMedicationName] = useState(
    initialCalculation?.medicationName ?? "",
  );
  const [indicatedDoseMl, setIndicatedDoseMl] = useState(
    initialCalculation?.indicatedDoseMl ?? "",
  );
  const [gunSizeMl, setGunSizeMl] = useState(initialCalculation?.gunSizeMl ?? "");
  const [useSaline, setUseSaline] = useState(initialCalculation?.useSaline ?? false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(
    initialCalculation?.result ?? null,
  );
  const [lastCalculation, setLastCalculation] = useState<LastCalculation | null>(
    initialCalculation,
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("calculadora");
  const [resultMedicationName, setResultMedicationName] = useState(
    initialCalculation?.medicationName ?? "",
  );
  const [successText, setSuccessText] = useState<string | null>(
    initialCalculation ? "Ultimo calculo cargado automaticamente." : null,
  );
  const [splitMode, setSplitMode] = useState<"auto" | "manual">(
    initialCalculation?.splitMode ?? "auto",
  );
  const [selectedShotOption, setSelectedShotOption] = useState(
    initialCalculation?.selectedShotOption ?? 0,
  );
  const [manualShotValues, setManualShotValues] = useState<string[]>(
    initialCalculation?.manualShotValues ?? [],
  );
  const selectedMedicationCard = getMedicationCardByName(medicationName);
  const riskVisual = selectedMedicationCard
    ? selectedMedicationCard.nivelRiesgo === "rojo"
      ? {
          label: "Rojo - antibiotico critico o riesgo alto",
          classes: "border-rose-400 bg-rose-100 text-rose-800",
          description:
            "Medicamento critico. Requiere maxima atencion en dosis, manejo o compatibilidades.",
        }
      : selectedMedicationCard.nivelRiesgo === "amarillo"
        ? {
            label: "Amarillo - precaucion",
            classes: "border-amber-400 bg-amber-100 text-amber-800",
            description:
              "Requiere atencion en la dosis o en el manejo. Uso correcto importante.",
          }
        : {
            label: "Verde - uso normal",
            classes: "border-emerald-400 bg-emerald-100 text-emerald-800",
            description: "Uso normal en campo, sin advertencias especiales.",
          }
    : null;

  const persistSelection = (
    mode: "auto" | "manual",
    optionIndex: number,
    manualValues: string[],
  ) => {
    if (!lastCalculation) return;
    const updated = {
      ...lastCalculation,
      splitMode: mode,
      selectedShotOption: optionIndex,
      manualShotValues: manualValues,
    };
    setLastCalculation(updated);
    window.localStorage.setItem(LAST_CALCULATION_KEY, JSON.stringify(updated));
  };

  const handleClear = () => {
    setNumberOfBooths("");
    setMedicationName("");
    setIndicatedDoseMl("");
    setGunSizeMl("");
    setUseSaline(false);
    setErrorText(null);
    setSuccessText(null);
    setResult(null);
    setResultMedicationName("");
    setSplitMode("auto");
    setSelectedShotOption(0);
    setManualShotValues([]);
    setLastCalculation(null);
    window.localStorage.removeItem(LAST_CALCULATION_KEY);
  };

  const handleCalculate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorText(null);
    setSuccessText(null);
    setResult(null);
    setIsCalculating(true);

    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 220);
    });

    if (!numberOfBooths || !medicationName || !indicatedDoseMl || !gunSizeMl) {
      setErrorText("Completa todos los campos obligatorios.");
      setIsCalculating(false);
      return;
    }

    const plazas = Number(numberOfBooths);
    const enteredDosePerPig = Number(indicatedDoseMl);
    const availableGunSize = Number(gunSizeMl);

    if (plazas <= 0 || enteredDosePerPig <= 0 || availableGunSize <= 0) {
      setErrorText("Introduce valores numericos validos y mayores que cero.");
      setIsCalculating(false);
      return;
    }

    let dosePerPig = enteredDosePerPig;
    let gunValuePerPig = dosePerPig;

    const fixedDose = medicationName
      ? FIXED_DOSES[medicationName as MedicationKey]
      : undefined;
    if (selectedMedicationCard?.tipo === "vacuna" && fixedDose) {
      dosePerPig = fixedDose;
      gunValuePerPig = dosePerPig;
    }

    if (selectedMedicationCard?.tipo === "vacuna") {
      if (useSaline) {
        setErrorText("Las vacunas no permiten suero.");
        setIsCalculating(false);
        return;
      }
      gunValuePerPig = dosePerPig;
    } else if (selectedMedicationCard?.tipo === "antibiotico") {
      // En antibioticos la dosis siempre la introduce el usuario manualmente.
      dosePerPig = enteredDosePerPig;
      if (selectedMedicationCard.permiteSuero) {
        gunValuePerPig = Math.ceil(Math.max(1, dosePerPig));
      } else {
        if (useSaline) {
          setErrorText("Este antibiotico no permite suero.");
          setIsCalculating(false);
          return;
        }
        gunValuePerPig = dosePerPig;
      }
    } else if (selectedMedicationCard?.tipo === "especial") {
      if (useSaline && !selectedMedicationCard.permiteSuero) {
        setErrorText(`${selectedMedicationCard.nombre} no permite suero.`);
        setIsCalculating(false);
        return;
      }
      gunValuePerPig = dosePerPig;
    } else if (useSaline) {
      gunValuePerPig = Math.ceil(Math.max(1, dosePerPig));
    }

    const salinePerPig = roundValue(gunValuePerPig - dosePerPig);
    if (!useSaline && salinePerPig > 0) {
      setErrorText(
        "Esta dosis necesita suero para completar la pistola. Activa 'Usar suero'.",
      );
      setIsCalculating(false);
      return;
    }

    const realDosePerPig = dosePerPig;
    const medicationTotal = roundValue(plazas * realDosePerPig);
    const salineTotal = roundValue(plazas * salinePerPig);
    const appliedVolumeTotal = roundValue(plazas * gunValuePerPig);
    const shotsPerPig = Math.max(1, Math.ceil(gunValuePerPig / availableGunSize));
    const dividedDoseMode = shotsPerPig > 1;
    const shotOptions = dividedDoseMode
      ? generateShotCombinations(dosePerPig, availableGunSize, shotsPerPig)
      : [];

    const calculatedResult: CalculationResult = {
      dosePerPig,
      gunValuePerPig,
      salinePerPig,
      dividedDoseMode,
      shotsPerPig,
      shotOptions,
      medicationTotal,
      salineTotal,
      appliedVolumeTotal,
      bottles250: safeCeilDivision(medicationTotal, 250),
      bottles200: safeCeilDivision(medicationTotal, 200),
      bottles100: safeCeilDivision(medicationTotal, 100),
      bottles50: safeCeilDivision(medicationTotal, 50),
    };

    const optimalShotOptionIndex = getOptimalShotOptionIndex(shotOptions);
    const optimalManualValues =
      shotOptions[optimalShotOptionIndex]?.map((value) => value.toFixed(1)) ?? [];

    const calculationToSave: LastCalculation = {
      timestamp: new Date().toISOString(),
      medicationName,
      numberOfBooths,
      indicatedDoseMl,
      gunSizeMl,
      useSaline,
      splitMode: "auto",
      selectedShotOption: optimalShotOptionIndex,
      manualShotValues: optimalManualValues,
      result: calculatedResult,
    };

    window.localStorage.setItem(
      LAST_CALCULATION_KEY,
      JSON.stringify(calculationToSave),
    );
    setLastCalculation(calculationToSave);
    setResult(calculatedResult);
    setResultMedicationName(medicationName);
    setSplitMode("auto");
    setSelectedShotOption(optimalShotOptionIndex);
    setManualShotValues(optimalManualValues);
    setSuccessText("Calculo completado correctamente.");
    setIsCalculating(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-start justify-center px-3 py-4 md:px-4 md:py-6">
      <section className="w-full rounded-3xl border border-white/50 bg-white/90 p-4 shadow-xl shadow-sky-100/70 backdrop-blur md:p-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
          Calculadora de Vacunaciones
        </h1>
        <p className="mt-3 text-center text-base leading-7 text-slate-600">
          Ingresa los datos para calcular medicacion, suero y volumen total.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("calculadora")}
            className={`h-12 rounded-xl text-base font-semibold transition ${
              activeTab === "calculadora"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Calculadora
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("informacion")}
            className={`h-12 rounded-xl text-base font-semibold transition ${
              activeTab === "informacion"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Informacion
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("info-medicamento")}
            className={`col-span-2 h-12 rounded-xl text-base font-semibold transition ${
              activeTab === "info-medicamento"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Informacion del medicamento
          </button>
        </div>

        {activeTab === "calculadora" && (
          <>
            <form className="mt-6 space-y-4" onSubmit={handleCalculate}>
          <label className="block">
            <span className="mb-2 block text-base font-medium text-slate-700">
              Numero de plazas
            </span>
            <input
              type="number"
              min={1}
              required
              value={numberOfBooths}
              onChange={(event) => setNumberOfBooths(event.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          {selectedMedicationCard?.advertencia && (
            <p
              className={`rounded-2xl border-2 px-4 py-4 text-center font-extrabold tracking-wide ${
                selectedMedicationCard.nivelRiesgo === "rojo"
                  ? "border-rose-500 bg-rose-100 text-rose-800 text-xl"
                  : "border-amber-400 bg-amber-100 text-amber-800 text-lg"
              }`}
            >
              ALERTA: {selectedMedicationCard.advertencia}
            </p>
          )}

          {selectedMedicationCard?.nivelRiesgo === "rojo" && (
            <p className="rounded-2xl border-2 border-rose-600 bg-rose-200 px-4 py-4 text-center text-xl font-extrabold tracking-wide text-rose-900">
              BANNER OBLIGATORIO: medicamento de riesgo alto
            </p>
          )}

          {medicationName === "selectan" && (
            <p className="rounded-xl border border-rose-400 bg-rose-50 px-4 py-3 text-base font-bold text-rose-800">
              NO MEZCLAR
            </p>
          )}

          {medicationName === "qivitan" && (
            <p className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-base font-bold text-amber-800">
              Uso responsable antibiotico
            </p>
          )}

          {selectedMedicationCard?.tipo === "vacuna" && (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-base font-semibold text-amber-800">
              No mezclar con otros productos
            </p>
          )}

          <label className="block">
            <span className="mb-2 block text-base font-medium text-slate-700">
              Medicamento
            </span>
            <select
              required
              value={medicationName}
              onChange={(event) => setMedicationName(event.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Selecciona un medicamento</option>
              {MEDICATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {riskVisual && (
            <div className="space-y-1">
              <p
                className={`rounded-xl border px-4 py-3 text-base font-bold ${riskVisual.classes}`}
              >
                Nivel de riesgo: {riskVisual.label}
              </p>
              <p className="px-1 text-xs leading-5 text-slate-600">{riskVisual.description}</p>
            </div>
          )}

          {selectedMedicationCard && (
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:sticky lg:top-4">
              <p className="text-sm font-semibold text-slate-800">Ficha del medicamento</p>
              <p className="mt-2 text-sm text-slate-700">
                Nombre: <strong>{selectedMedicationCard.nombre}</strong>
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Tipo: <strong>{selectedMedicationCard.tipo}</strong>
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Nivel de riesgo: <strong>{selectedMedicationCard.nivelRiesgo}</strong>
              </p>
              {selectedMedicationCard.advertencia && (
                <p className="mt-2 rounded-lg border border-rose-300 bg-rose-100 px-3 py-2 text-sm font-bold text-rose-800">
                  Advertencia: {selectedMedicationCard.advertencia}
                </p>
              )}
              <p className="mt-2 text-sm font-medium text-slate-800">Recomendaciones:</p>
              <ul className="mt-1 max-h-52 list-disc overflow-auto pl-5 pr-2 text-sm text-slate-700">
                {selectedMedicationCard.recomendaciones.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          )}

          <label className="block">
            <span className="mb-2 block text-base font-medium text-slate-700">
              Dosis indicada (ml)
            </span>
            <input
              type="number"
              min={0.1}
              step={0.1}
              required
              value={indicatedDoseMl}
              onChange={(event) => setIndicatedDoseMl(event.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-base font-medium text-slate-700">
              Pistola disponible
            </span>
            <select
              required
              value={gunSizeMl}
              onChange={(event) => setGunSizeMl(event.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Selecciona una opcion</option>
              <option value="1">1 ml</option>
              <option value="2">2 ml</option>
              <option value="3">3 ml</option>
              <option value="4">4 ml</option>
              <option value="5">5 ml</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              checked={useSaline}
              onChange={(event) => setUseSaline(event.target.checked)}
              className="h-6 w-6 rounded border-slate-300 text-sky-600 focus:ring-sky-300"
            />
            <span className="text-base font-medium text-slate-700">Usar suero</span>
          </label>

          {useSaline &&
            selectedMedicationCard?.permiteSuero && (
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-base font-medium text-sky-800">
                Se anadira suero automaticamente.
              </p>
            )}

          {errorText && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
              {errorText}
            </p>
          )}

          {successText && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base text-emerald-700">
              {successText}
            </p>
          )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={isCalculating}
              className="h-16 w-full rounded-2xl bg-sky-600 text-lg font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCalculating ? "Calculando..." : "Calcular"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="h-16 w-full rounded-2xl border border-slate-300 bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              Limpiar datos
            </button>
              </div>
            </form>

            {lastCalculation && (
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-semibold text-sky-900">Ultimo calculo guardado</p>
                <p className="mt-2 text-sm text-sky-800">
                  Medicamento:{" "}
                  <strong>
                    {getMedicationCardByName(lastCalculation.medicationName)?.nombre ??
                      lastCalculation.medicationName}
                  </strong>{" "}
                  | Plazas:{" "}
                  <strong>{lastCalculation.numberOfBooths}</strong>
                </p>
                <p className="mt-1 text-sm text-sky-800">
                  Dosis: <strong>{lastCalculation.indicatedDoseMl} ml</strong> | Pistola:{" "}
                  <strong>{lastCalculation.gunSizeMl} ml</strong>
                </p>
                <p className="mt-1 text-sm text-sky-800">
                  Medicamento total:{" "}
                  <strong>{lastCalculation.result.medicationTotal.toFixed(2)} ml</strong>
                </p>
                <p className="mt-1 text-xs text-sky-700">
                  Guardado: {new Date(lastCalculation.timestamp).toLocaleString("es-ES")}
                </p>
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Resumen por cerdo</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Valor pistola</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {result.gunValuePerPig.toFixed(2)} ml
                  </p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Suero por cerdo</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {result.salinePerPig.toFixed(2)} ml
                  </p>
                </article>
              </div>
              {result.dividedDoseMode && (
                <div className="mt-3 space-y-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-3">
                  <p className="rounded-lg border-2 border-violet-500 bg-white px-3 py-3 text-center text-lg font-extrabold text-violet-900">
                    Se requieren {result.shotsPerPig} pinchazos por cerdo
                  </p>
                  <p className="rounded-lg bg-violet-100 px-3 py-2 text-center text-base font-bold text-violet-900">
                    Distribucion seleccionada:{" "}
                    {splitMode === "manual"
                      ? `${manualShotValues
                          .map((value) => `${value || "0"} ml`)
                          .join(" + ")}`
                      : `${(result.shotOptions[selectedShotOption] ?? [])
                          .map((value) => `${value.toFixed(1)} ml`)
                          .join(" + ")}`}
                  </p>
                  {result.shotOptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-violet-700">
                        Elige una combinacion (la opcion marcada por defecto es la optima):
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSplitMode("auto");
                            persistSelection("auto", selectedShotOption, manualShotValues);
                          }}
                          className={`h-10 rounded-lg border text-sm font-semibold ${
                            splitMode === "auto"
                              ? "border-violet-400 bg-violet-100 text-violet-800"
                              : "border-violet-200 bg-white text-violet-700"
                          }`}
                        >
                          Automatico
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const defaults =
                              result.shotOptions[selectedShotOption]?.map((value) =>
                                value.toFixed(1),
                              ) ?? [];
                            setSplitMode("manual");
                            if (manualShotValues.length === 0) {
                              setManualShotValues(defaults);
                              persistSelection("manual", selectedShotOption, defaults);
                              return;
                            }
                            persistSelection("manual", selectedShotOption, manualShotValues);
                          }}
                          className={`h-10 rounded-lg border text-sm font-semibold ${
                            splitMode === "manual"
                              ? "border-violet-400 bg-violet-100 text-violet-800"
                              : "border-violet-200 bg-white text-violet-700"
                          }`}
                        >
                          Manual
                        </button>
                      </div>

                      {splitMode === "auto" &&
                        result.shotOptions.map((option, index) => (
                          <label
                            key={`${option.join("-")}-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-white px-2 py-2 text-sm text-violet-900"
                          >
                            <input
                              type="radio"
                              name="shotOption"
                              checked={selectedShotOption === index}
                              onChange={() => {
                                setSelectedShotOption(index);
                                const nextManual = option.map((value) => value.toFixed(1));
                                setManualShotValues(nextManual);
                                persistSelection("auto", index, nextManual);
                              }}
                              className="h-4 w-4 border-violet-300 text-violet-600 focus:ring-violet-300"
                            />
                            {option.map((value) => value.toFixed(1)).join(" + ")} ml
                          </label>
                        ))}

                      {splitMode === "manual" && (
                        <div className="space-y-2 rounded-lg bg-white p-2">
                          <p className="text-xs font-medium text-violet-700">
                            Introduce los valores por pinchazo:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: result.shotsPerPig }).map((_, index) => (
                              <input
                                key={index}
                                type="number"
                                min={0.1}
                                step={0.1}
                                value={manualShotValues[index] ?? ""}
                                onChange={(event) => {
                                  const next = [...manualShotValues];
                                  next[index] = event.target.value;
                                  setManualShotValues(next);
                                  persistSelection("manual", selectedShotOption, next);
                                }}
                                className="h-10 rounded-lg border border-violet-200 px-3 text-sm text-violet-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                                placeholder={`Pinchazo ${index + 1}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-violet-700">
                            Total manual:{" "}
                            <strong>
                              {manualShotValues
                                .reduce(
                                  (acc, value) =>
                                    acc + (Number.isNaN(Number(value)) ? 0 : Number(value)),
                                  0,
                                )
                                .toFixed(1)}{" "}
                              ml
                            </strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Totales aplicados</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Medicamento total (dosis real)</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {result.medicationTotal.toFixed(2)} ml
                  </p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Suero total</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {result.salineTotal.toFixed(2)} ml
                  </p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Volumen total aplicado</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {result.appliedVolumeTotal.toFixed(2)} ml
                  </p>
                </article>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Botes necesarios</p>
              {getBottleSizesForMedication(resultMedicationName).length === 0 ? (
                <p className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                  Segun dosis comerciales.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {getBottleSizesForMedication(resultMedicationName).map((size) => (
                    <article
                      key={size}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-center"
                    >
                      <p className="text-xs text-slate-500">{size} ml</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">
                        {safeCeilDivision(result.medicationTotal, size)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
              </div>
            )}
          </>
        )}

        {activeTab === "informacion" && (
          <div className="mt-8 space-y-3">
            {Object.entries(MEDICATION_CARDS)
              .filter(([key]) => key !== "manual")
              .map(([key, rawFicha]) => {
                const ficha = rawFicha as MedicationCard;
                const riskStyles =
                  ficha.nivelRiesgo === "rojo"
                    ? "border-rose-300 bg-rose-50"
                    : ficha.nivelRiesgo === "amarillo"
                      ? "border-amber-300 bg-amber-50"
                      : "border-emerald-300 bg-emerald-50";

                return (
                  <article key={key} className={`rounded-2xl border p-4 ${riskStyles}`}>
                    <p className="text-base font-semibold text-slate-900">{ficha.nombre}</p>
                    <p className="mt-1 text-sm text-slate-700">
                      Tipo: {ficha.tipo} | Riesgo: {ficha.nivelRiesgo}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Suero: {ficha.permiteSuero ? "permitido" : "no permitido"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Dosis por peso: {ficha.dosisPorPeso ? "si" : "no"}
                    </p>
                    {ficha.tamanos.length > 0 && (
                      <p className="mt-1 text-sm text-slate-700">
                        Botes: {ficha.tamanos.join(", ")} ml
                      </p>
                    )}
                    {ficha.advertencia && (
                      <p className="mt-1 text-sm font-bold text-slate-900">{ficha.advertencia}</p>
                    )}
                    <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                      {ficha.recomendaciones.map((recomendacion) => (
                        <li key={recomendacion}>{recomendacion}</li>
                      ))}
                    </ul>
                  </article>
                );
              })}
          </div>
        )}

        {activeTab === "info-medicamento" && (
          <div className="mt-8">
            {!selectedMedicationCard ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Selecciona un medicamento en la pestana Calculadora para ver su
                informacion.
              </p>
            ) : (
              <article className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-base font-semibold text-slate-900">
                  {selectedMedicationCard.nombre}
                </p>
                <p className="text-sm text-slate-700">
                  <strong>Uso principal:</strong> {selectedMedicationCard.usoPrincipal}
                </p>
                <p className="text-sm text-slate-700">
                  <strong>Enfermedades:</strong> {selectedMedicationCard.enfermedades.join(", ")}
                </p>
                <p className="text-sm text-slate-700">
                  <strong>Cuando se usa:</strong> {selectedMedicationCard.cuandoSeUsa}
                </p>
                <div className="text-sm text-slate-700">
                  <strong>Notas:</strong>
                  <ul className="mt-1 list-disc pl-5">
                    {selectedMedicationCard.notasCampo.map((nota) => (
                      <li key={nota}>{nota}</li>
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
