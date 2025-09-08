    import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// categorías de ejemplo (puedes ampliar)
const DEFAULT_CATEGORIES = [
  "Comida y bebida",
  "Transporte",
  "Alojamiento",
  "Entretenimiento",
  "Mercado",
  "Otro",
];

const currencyLabel = (c) =>
  ({ COP: "Peso colombiano", USD: "Dólar (USD)", EUR: "Euro (EUR)" }[c] || c);

// --- Utilidades ---
const fmtMoney = (n) =>
  (typeof n === "number" ? n : Number(n || 0)).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ymd = (d) => new Date(d).toISOString().slice(0, 10);

// calcula saldos por miembro (igualitario sobre los seleccionados)
function computeBalances(expenses, members) {
  const map = Object.fromEntries((members || []).map((m) => [m._id, 0]));
  for (const e of expenses) {
    const amount = Number(e.amount || 0);
    const included = (e.splitAmong || e.participants || []).filter(Boolean);
    if (!amount || included.length === 0) continue;

    const share = amount / included.length;
    // cada incluido "debe" su parte
    for (const pid of included) {
      if (map[pid] === undefined) map[pid] = 0;
      map[pid] -= share;
    }
    // quien pagó tiene favor por el total
    if (e.paidBy) {
      if (map[e.paidBy] === undefined) map[e.paidBy] = 0;
      map[e.paidBy] += amount;
    }
  }
  return map; // { memberId: balance }
}

export default function GroupDetail({ token, userId }) {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const [tab, setTab] = useState("gastos"); // 'gastos' | 'saldos' | 'fotos'

  // Modal añadir gasto
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categoryMode, setCategoryMode] = useState("preset"); // preset | custom
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("COP");
  const [paidBy, setPaidBy] = useState(null);
  const [date, setDate] = useState(ymd(new Date()));
  const [divideEqually, setDivideEqually] = useState(true);
  const [selected, setSelected] = useState({}); // { memberId: boolean }

  // --- cargar grupo + gastos ---
  useEffect(() => {
    const run = async () => {
      try {
        // 1) grupo con miembros (populate)
        const gRes = await fetch(`/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}`, "x-auth-token": token },
        });
        const gData = await gRes.json();
        if (!gRes.ok) throw new Error(gData?.msg || "No se pudo cargar el grupo");
        setGroup(gData);

        // defaults del modal
        setCurrency(gData.currency || "COP");
        const myId = userId || ""; // si lo pasas como prop
        const firstMemberId = gData.members?.[0]?._id || null;
        setPaidBy(gData.members?.find((m) => m._id === myId)?._id || firstMemberId);

        // marcar todos seleccionados inicialmente
        const initSel = {};
        (gData.members || []).forEach((m) => (initSel[m._id] = true));
        setSelected(initSel);

        // 2) gastos (intentamos ?group=..., si no, fallback a /groups/:id/expenses)
        let exps = [];
        let eRes = await fetch(`/api/expenses?group=${groupId}`, {
          headers: { Authorization: `Bearer ${token}`, "x-auth-token": token },
        });
        if (eRes.ok) {
          const eData = await eRes.json();
          exps = Array.isArray(eData) ? eData : [];
        } else {
          const fRes = await fetch(`/api/groups/${groupId}/expenses`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-auth-token": token,
            },
          });
          if (fRes.ok) {
            const fData = await fRes.json();
            exps = Array.isArray(fData) ? fData : [];
          }
        }
        // normaliza fechas y ordena desc
        exps = exps
          .map((e) => ({
            ...e,
            date: e.date || e.createdAt || new Date().toISOString(),
            splitAmong: e.splitAmong || e.participants || [],
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(exps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [groupId, token, userId]);

  const groupedByDate = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      const key = ymd(e.date);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    // ordenar fechas desc
    return Object.fromEntries(
      Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]))
    );
  }, [expenses]);

  const balances = useMemo(() => {
    if (!group) return {};
    return computeBalances(expenses, group.members || []);
  }, [expenses, group]);

  // --- handlers ---
  const toggleSelected = (memberId) =>
    setSelected((prev) => ({ ...prev, [memberId]: !prev[memberId] }));

  const handleOpenAdd = () => {
    setTitle("");
    setCategory("");
    setCategoryMode("preset");
    setAmount("");
    setCurrency(group?.currency || "COP");
    setPaidBy(paidBy || group?.members?.[0]?._id || null);
    setDate(ymd(new Date()));
    setDivideEqually(true);
    // todos marcados
    const initSel = {};
    (group?.members || []).forEach((m) => (initSel[m._id] = true));
    setSelected(initSel);
    setAddOpen(true);
  };

  const createExpensePayload = () => {
    const participants = Object.entries(selected)
      .filter(([, v]) => !!v)
      .map(([k]) => k);
    return {
      group: groupId,
      title: title.trim(),
      category: categoryMode === "custom" ? (category || "Personalizado") : (category || "Otro"),
      amount: Number(amount),
      currency,
      paidBy,
      date,
      splitEvenly: divideEqually,
      splitAmong: participants,
    };
  };

  const handleAddExpense = async () => {
    const payload = createExpensePayload();
    if (!payload.title || !payload.amount || !payload.paidBy || payload.splitAmong.length === 0) {
      alert("Completa título, cantidad, quién pagó y a quién se divide.");
      return;
    }
    try {
      // endpoint principal
      let res = await fetch(`/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-auth-token": token,
        },
        body: JSON.stringify(payload),
      });

      // fallback si tu backend espera /groups/:id/expenses
      if (!res.ok) {
        res = await fetch(`/api/groups/${groupId}/expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-auth-token": token,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        const saved = data?.expense || data; // depende de tu API
        const norm = {
          ...saved,
          date: saved.date || saved.createdAt || new Date().toISOString(),
          splitAmong: saved.splitAmong || saved.participants || payload.splitAmong,
        };
        setExpenses((prev) =>
          [norm, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
        );
        setAddOpen(false);
      } else {
        alert(data?.msg || "No se pudo crear el gasto");
      }
    } catch (err) {
      console.error("Error creando gasto:", err);
      alert("Error de red");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Cargando grupo…</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-indigo-600 hover:underline"
        >
          ← Volver
        </button>
        <p className="text-rose-600">No se encontró el grupo.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-indigo-600 hover:underline"
      >
        ← Volver
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
          <p className="text-sm text-gray-500">
            {currencyLabel(group.currency || "COP")} • {group.members?.length || 0} miembros
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b flex gap-6">
        {["gastos", "saldos", "fotos"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 -mb-px ${
              tab === t
                ? "border-b-2 border-indigo-600 text-indigo-700 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "gastos" ? "Gastos" : t === "saldos" ? "Saldos" : "Fotos"}
          </button>
        ))}
      </div>

      {/* Contenido pestañas */}
      {tab === "gastos" && (
        <div className="mt-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow"
            >
              Añadir gasto
            </button>
          </div>

          {/* Lista agrupada por fecha */}
          {Object.keys(groupedByDate).length === 0 ? (
            <p className="text-gray-500">Aún no hay gastos.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([dateKey, items]) => (
                <div key={dateKey}>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    {new Date(dateKey).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </h4>
                  <div className="space-y-2">
                    {items.map((e) => (
                      <details
                        key={e._id || e.id || `${dateKey}-${e.title}-${Math.random()}`}
                        className="bg-white rounded-xl border px-4 py-3"
                      >
                        <summary className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-800 font-medium">
                              {e.title}
                            </span>
                            {e.category && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {e.category}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-800 font-semibold">
                            {e.currency || group.currency} {fmtMoney(e.amount)}
                          </span>
                        </summary>
                        <div className="mt-3 text-sm text-gray-600">
                          <p>
                            Pagado por:{" "}
                            <strong>
                              {group.members?.find((m) => m._id === e.paidBy)?.name ||
                                "Alguien"}
                            </strong>
                          </p>
                          <p>
                            Dividido entre:{" "}
                            {(e.splitAmong || [])
                              .map(
                                (id) =>
                                  group.members?.find((m) => m._id === id)?.name || "Miembro"
                              )
                              .join(", ")}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Fecha: {new Date(e.date).toLocaleString("es-ES")}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal añadir gasto */}
          {addOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Añadir gasto
                  </h3>
                  <button
                    onClick={() => setAddOpen(false)}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Cerrar
                  </button>
                </div>

                {/* 1. Título + categoría */}
                <div className="grid md:grid-cols-12 gap-3 mb-4">
                  <div className="md:col-span-7">
                    <label className="block text-sm font-medium text-gray-700">
                      Título
                    </label>
                    <input
                      type="text"
                      placeholder="Por ejemplo, Bebidas"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700">
                      Categoría
                    </label>
                    <div className="mt-1 flex gap-2">
                      <select
                        value={categoryMode === "preset" ? category : "custom"}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setCategoryMode("custom");
                            setCategory("");
                          } else {
                            setCategoryMode("preset");
                            setCategory(e.target.value);
                          }
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
                      >
                        {DEFAULT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="custom">Personalizar…</option>
                      </select>
                    </div>
                    {categoryMode === "custom" && (
                      <input
                        type="text"
                        placeholder="Escribe la categoría"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    )}
                  </div>
                </div>

                {/* 2. Cantidad + Moneda */}
                <div className="grid md:grid-cols-12 gap-3 mb-4">
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Moneda
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="COP">Peso colombiano</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                {/* 3. Pagado por y Cuándo */}
                <div className="grid md:grid-cols-12 gap-3 mb-4">
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Pagado por
                    </label>
                    <select
                      value={paidBy || ""}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {(group.members || []).map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name || m.email} {m._id === userId ? "(Yo)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Cuándo
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* 4. Dividir */}
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Dividir
                    </label>
                    <button
                      onClick={() => setDivideEqually(true)}
                      className={`text-sm px-2 py-1 rounded ${
                        divideEqually
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Igualmente 👍
                    </button>
                  </div>
                  <ul className="mt-2 grid md:grid-cols-2 gap-2">
                    {(group.members || []).map((m) => (
                      <li
                        key={m._id}
                        className="flex items-center justify-between border rounded-lg px-3 py-2"
                      >
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selected[m._id]}
                            onChange={() => toggleSelected(m._id)}
                          />
                          <span>
                            {m.name || m.email}{" "}
                            {m._id === userId ? <em className="text-xs">(Yo)</em> : null}
                          </span>
                        </label>
                        <span className="text-xs text-gray-500">
                          {currency} 0
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAddExpense}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                  >
                    Añadir gasto
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "saldos" && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(group.members || []).map((m) => {
            const b = balances[m._id] || 0;
            return (
              <div key={m._id} className="bg-white rounded-xl border p-4">
                <p className="text-gray-700 font-medium">
                  {m.name || m.email} {m._id === userId ? <em className="text-xs">(Yo)</em> : null}
                </p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    b >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {b >= 0 ? "A favor" : "En contra"}: {group.currency || "COP"}{" "}
                  {fmtMoney(Math.abs(b))}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "fotos" && (
        <div className="mt-6">
          <div className="bg-white rounded-xl border p-6 text-center text-gray-500">
            Zona para subir y ver fotos del viaje/grupo (próximamente).
          </div>
        </div>
      )}
    </div>
  );
}
