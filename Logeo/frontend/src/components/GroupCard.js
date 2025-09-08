import { useState, useRef, useEffect } from "react";
import { FaEllipsisV, FaUsers, FaPen, FaTrash } from "react-icons/fa";

export default function GroupCard({ group, onDelete, onEdit, onOpen }) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const memberCount = new Set(
    (group.members || []).map((m) => (m?._id || m)?.toString?.() || String(m))
  ).size;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(group)}
      className="relative bg-white shadow-md rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
    >
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">
            {group?.name || "Grupo sin nombre"}
          </h3>

          {/* Menú de 3 puntos */}
          <div
            className="relative"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((v) => !v);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Abrir menú del grupo"
            >
              <FaEllipsisV className="w-4 h-4 text-gray-600" />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md z-50">
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    onEdit?.(group);
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <FaPen className="text-gray-500" /> Editar
                </button>
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    onDelete?.(group._id);
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {group?.description || "Sin descripción"}
        </p>

        <div className="mt-3 text-xs text-gray-500 space-y-0.5">
          <p>
            Creado: <span className="font-medium">{formatDate(group?.createdAt)}</span>
          </p>
          <p>
            Última actividad:{" "}
            <span className="font-medium">{formatDate(group?.updatedAt)}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-gray-600">
          <FaUsers /> {memberCount} miembros
        </span>
      </div>
    </div>
  );
}
