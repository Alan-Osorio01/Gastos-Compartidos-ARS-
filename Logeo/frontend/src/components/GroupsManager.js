import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import GroupCard from "./GroupCard";



// Helper: parsear y validar emails (para el modal de creación cuando invites por correo)
const parseEmails = (text) => {
  const parts = (text || "")
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return parts.filter((e) => emailRegex.test(e.toLowerCase()));
};

// Monedas disponibles
const CURRENCIES = [
  { code: "COP", label: "Peso colombiano" },
  { code: "USD", label: "Dólar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GroupsManager = ({ userId, token }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [search, setSearch] = useState("");

  // Modal unificado: crear/editar
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formGroup, setFormGroup] = useState({
    name: "",
    description: "",
    currency: "COP",
    isFavorite: false,
  });

  // Participantes (solo visibles en modo CREAR)
  const [participants, setParticipants] = useState([
    { name: "", email: "", type: "Personal" },
  ]);

  // Ver miembros (UI retirada del Card; lo dejo por si luego quieres reusarlo)
  const [membersOpen, setMembersOpen] = useState(false);
  const [membersGroup, setMembersGroup] = useState(null);

  // Agregar miembros (UI retirada del Card; lo dejo por si luego quieres reusarlo)
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForGroup, setInviteForGroup] = useState(null);
  const [emailsInput, setEmailsInput] = useState("");
  const [addResult, setAddResult] = useState(null);
  const emailsParsed = useMemo(() => parseEmails(emailsInput), [emailsInput]);

  // Cargar grupos
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("/api/groups", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-auth-token": token,
          },
        });
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
        setFilteredGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando grupos:", err);
      }
    };
    fetchGroups();
  }, [token]);

  // Filtro
  useEffect(() => {
    const q = (search || "").toLowerCase();
    setFilteredGroups(groups.filter((g) => g?.name?.toLowerCase().includes(q)));
  }, [search, groups]);

  // -------- Helpers participantes (solo crear) --------
  const addParticipantRow = () =>
    setParticipants((prev) => [
      ...prev,
      { name: "", email: "", type: "Personal" },
    ]);

  const updateParticipant = (idx, field, value) =>
    setParticipants((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );

  const removeParticipantRow = (idx) =>
    setParticipants((prev) => prev.filter((_, i) => i !== idx));

  // -------- Abrir modal en modo CREAR --------
  const openCreateGroup = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormGroup({
      name: "",
      description: "",
      currency: "COP",
      isFavorite: false,
    });
    setParticipants([{ name: "", email: "", type: "Personal" }]);
    setShowCreateModal(true);
  };

  // -------- Abrir modal en modo EDITAR (desde los 3 puntos) --------
  const openEditGroup = (group) => {
    setIsEditMode(true);
    setEditingId(group._id);
    setFormGroup({
      name: group.name || "",
      description: group.description || "",
      currency: group.currency || "COP",
      isFavorite: !!group.isFavorite,
    });
    setShowCreateModal(true);
  };

  // -------- Crear o Editar (submit del modal unificado) --------
  const handleSubmitGroup = async () => {
    const name = (formGroup.name || "").trim();
    if (!name) return;

    if (isEditMode && editingId) {
      // EDITAR
      try {
        const res = await fetch(`/api/groups/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-auth-token": token,
          },
          body: JSON.stringify({
            name,
            description: (formGroup.description || "").trim(),
            // Envío también moneda y favorito: si tu backend PUT aún no los maneja, simplemente los ignorará.
            currency: formGroup.currency,
            isFavorite: !!formGroup.isFavorite,
          }),
        });
        const data = await res.json();
        if (res.ok && data?.group) {
          setGroups((prev) =>
            prev.map((g) => (g._id === data.group._id ? data.group : g))
          );
          setShowCreateModal(false);
          setIsEditMode(false);
          setEditingId(null);
        } else {
          alert(data?.msg || "No se pudo editar el grupo");
        }
      } catch (err) {
        console.error("Error editando grupo:", err);
        alert("Error de red");
      }
      return;
    }

    // CREAR
    const inviteEmails = Array.from(
      new Set(
        participants
          .map((p) => (p.email || "").trim().toLowerCase())
          .filter((e) => emailRe.test(e))
      )
    );

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-auth-token": token,
        },
        body: JSON.stringify({
          name,
          description: (formGroup.description || "").trim(),
          currency: formGroup.currency || "COP",
          isFavorite: !!formGroup.isFavorite,
          inviteEmails,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.group) {
        setGroups([data.group, ...groups]);
        setShowCreateModal(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormGroup({
          name: "",
          description: "",
          currency: "COP",
          isFavorite: false,
        });
        setParticipants([{ name: "", email: "", type: "Personal" }]);
      } else {
        alert(data?.msg || "No se pudo crear el grupo");
      }
    } catch (err) {
      console.error("Error creando grupo:", err);
      alert("Error de red");
    }
  };

  // -------- Eliminar miembro (la UI ya no se muestra en Card; lo conservo por si reusas) --------
  const handleRemoveMember = async (groupId, memberId) => {
    if (!window.confirm("¿Eliminar a este miembro del grupo?")) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-auth-token": token,
        },
      });
      const data = await res.json();
      if (res.ok && data?.group) {
        setGroups((prev) =>
          prev.map((g) => (g._id === data.group._id ? data.group : g))
        );
        if (membersGroup?._id === data.group._id) {
          setMembersGroup(data.group);
        }
      } else {
        alert(data?.msg || "No se pudo eliminar al miembro");
      }
    } catch (err) {
      console.error("Error eliminando miembro:", err);
      alert("Error de red");
    }
  };

  // -------- Eliminar grupo --------
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("¿Eliminar este grupo?")) return;
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-auth-token": token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setGroups(groups.filter((g) => g._id !== groupId));
      } else {
        alert(data?.msg || "No se pudo eliminar");
      }
    } catch (err) {
      console.error("Error eliminando grupo:", err);
      alert("Error de red");
    }
  };

  // -------- (Opcional) Ver miembros / Invitar por correo (sin accesos desde Card ahora) --------
  const openViewMembers = async (group) => {
    try {
      const res = await fetch(`/api/groups/${group._id}`, {
        headers: { Authorization: `Bearer ${token}`, "x-auth-token": token },
      });
      const data = await res.json();
      const filled = res.ok ? data : group;
      setMembersGroup(filled);
      setMembersOpen(true);
    } catch {
      setMembersGroup(group);
      setMembersOpen(true);
    }
  };

  const openAddMembers = (group) => {
    setInviteForGroup(group);
    setInviteOpen(true);
    setEmailsInput("");
    setAddResult(null);
  };

  const handleAddByEmails = async () => {
    if (emailsParsed.length === 0) return;

    try {
      const res = await fetch(
        `/api/groups/${inviteForGroup._id}/add-members-by-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-auth-token": token,
          },
          body: JSON.stringify({ emails: emailsParsed }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        setAddResult({
          added: data.added || [],
          already: data.alreadyMembers || [],
          notFound: data.notFound || [],
        });

        if (data?.group?._id) {
          setGroups((prev) =>
            prev.map((g) => (g._id === data.group._id ? data.group : g))
          );
        }
      } else {
        alert(data?.msg || "No se pudo agregar");
      }
    } catch (err) {
      console.error("Error agregando por email:", err);
      alert("Error de red");
    }
  };

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 drop-shadow">
          Mis Grupos
        </h2>
        <button
          onClick={openCreateGroup}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FaPlus /> Crear Grupo
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar entre tus grupos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Lista */}
      {filteredGroups.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onDelete={handleDeleteGroup}
              onEdit={openEditGroup}
              onOpen={(g) => navigate(`/groups/${g._id}`)}
              // onAddMember / onViewMembers removidos del menú en GroupCard
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-16">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="No groups"
            className="w-32 mx-auto mb-4 opacity-70"
          />
          <p className="text-gray-200 mb-4">
            Aún no tienes grupos. ¡Crea uno para empezar a compartir gastos!
          </p>
          <button
            onClick={openCreateGroup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow"
          >
            Crear mi primer grupo
          </button>
        </div>
      )}

      {/* MODAL UNIFICADO: Crear/Editar grupo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditMode ? "Editar Grupo" : "Crear Nuevo Grupo"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditMode(false);
                  setEditingId(null);
                }}
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>

            {/* Sección 1: Título del Grupo */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formGroup.isFavorite}
                    onChange={(e) =>
                      setFormGroup({
                        ...formGroup,
                        isFavorite: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  Favorito
                </label>
              </div>
              <input
                type="text"
                placeholder="Por ejemplo, Viaje a la Ciudad"
                value={formGroup.name}
                onChange={(e) =>
                  setFormGroup({ ...formGroup, name: e.target.value })
                }
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={formGroup.description}
                onChange={(e) =>
                  setFormGroup({ ...formGroup, description: e.target.value })
                }
                className="mt-3 w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            {/* Sección 2: Opciones de Divisa */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Opciones
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Divisa:</span>
                <select
                  value={formGroup.currency}
                  onChange={(e) =>
                    setFormGroup({ ...formGroup, currency: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span title="Seleccionada">✅</span>
              </div>
            </div>

            {/* Sección 3: Participantes (solo en CREAR) */}
            {!isEditMode && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Miembros
                </h4>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {participants.map((p, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-3 items-end"
                    >
                      <div className="col-span-4">
                        <label className="block text-xs text-gray-600 mb-1">
                          Nombre del participante
                        </label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) =>
                            updateParticipant(idx, "name", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Ej: Alex"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-xs text-gray-600 mb-1">
                          Correo
                        </label>
                        <input
                          type="email"
                          value={p.email}
                          onChange={(e) =>
                            updateParticipant(idx, "email", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="alex@correo.com"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Etiqueta
                        </label>
                        <input
                          type="text"
                          value={p.type}
                          onChange={(e) =>
                            updateParticipant(idx, "type", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Personal"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {participants.length > 1 && (
                          <button
                            onClick={() => removeParticipantRow(idx)}
                            className="text-rose-600 text-sm hover:underline"
                            title="Quitar"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <button
                    onClick={addParticipantRow}
                    className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    Añadir Otro Participante
                  </button>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditMode(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitGroup}
                disabled={!formGroup.name.trim()}
                className={`px-4 py-2 rounded-lg text-white shadow ${
                  formGroup.name.trim()
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isEditMode ? "Guardar Cambios" : "Crea un tricount"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* (Opcional) MODAL: Ver miembros */}
      {membersOpen && membersGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Miembros de {membersGroup.name}
            </h3>
            <ul className="space-y-2 text-gray-700 max-h-64 overflow-y-auto">
              {membersGroup.members?.length > 0 ? (
                membersGroup.members.map((m) => (
                  <li
                    key={m._id || m.email}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <span className="font-medium">
                        {m.name || "(sin nombre)"}
                      </span>
                      <span className="text-gray-500 ml-2">{m.email}</span>
                    </div>
                    <button
                      onClick={() =>
                        handleRemoveMember(membersGroup._id, m._id)
                      }
                      className="text-rose-600 text-sm hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">No hay miembros aún</li>
              )}
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setMembersOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* (Opcional) MODAL: Agregar miembros por correo */}
      {inviteOpen && inviteForGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Agregar miembros — {inviteForGroup.name}
              </h3>
              <button
                onClick={() => setInviteOpen(false)}
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Añadir por correo</h4>
              <textarea
                rows={3}
                placeholder="Escribe correos separados por coma, espacio o salto de línea"
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              {/* Vista previa en chips */}
              <div className="mt-2 flex flex-wrap gap-2">
                {emailsParsed.map((em) => (
                  <span
                    key={em}
                    className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
                  >
                    {em}
                  </span>
                ))}
                {emailsParsed.length === 0 && (
                  <span className="text-xs text-gray-400">
                    No hay correos válidos aún…
                  </span>
                )}
              </div>

              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddByEmails}
                  disabled={emailsParsed.length === 0}
                  className={`px-4 py-2 rounded-lg text-white shadow ${
                    emailsParsed.length > 0
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Agregar
                </button>
              </div>

              {/* Resultado */}
              {addResult && (
                <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-emerald-700">Agregados</p>
                    <ul className="list-disc list-inside text-emerald-700">
                      {addResult.added.length ? (
                        addResult.added.map((e) => <li key={e}>{e}</li>)
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-700">
                      Ya eran miembros
                    </p>
                    <ul className="list-disc list-inside text-amber-700">
                      {addResult.already.length ? (
                        addResult.already.map((e) => <li key={e}>{e}</li>)
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-rose-700">No encontrados</p>
                    <ul className="list-disc list-inside text-rose-700">
                      {addResult.notFound.length ? (
                        addResult.notFound.map((e) => <li key={e}>{e}</li>)
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setInviteOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManager;
