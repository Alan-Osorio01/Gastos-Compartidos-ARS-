// backend/routes/groups.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { createGroupSchema, updateGroupSchema } = require('../middleware/validators');
const { Types } = require('mongoose');

function dedupeMembers(members) {
  const clean = (members || []).filter(Boolean).map(m => m.toString());
  return Array.from(new Set(clean));
}

function requireValidId(id, res) {
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ msg: 'ID inválido' });
    return false;
  }
  return true;
}

// ===================== CREAR GRUPO =====================
router.post('/', auth, validate.body(createGroupSchema), async (req, res) => {
  try {
    let { name, description, currency, isFavorite, inviteEmails } = req.body;

    const creatorId = req.user.id.toString();

    // normaliza emails a minúsculas
    inviteEmails = (inviteEmails || []).map(e => String(e).toLowerCase());

    const users = inviteEmails.length
      ? await User.find({ email: { $in: inviteEmails } }).select('_id email')
      : [];

    const foundEmails = new Set(users.map(u => u.email));
    const addedEmails = [];
    const alreadyMembers = [];
    const notFound = inviteEmails.filter(e => !foundEmails.has(e));

    const memberSet = new Set([creatorId, ...users.map(u => u._id.toString())]);

    const group = await Group.create({
      name,
      description,
      currency,
      isFavorite: !!isFavorite,
      members: Array.from(memberSet),
      lastActivity: Date.now()
    });

    const populated = await Group.findById(group._id).populate('members', 'name email');
    addedEmails.push(...users.map(u => u.email));

    res.status(201).json({
      msg: 'Grupo creado',
      group: populated,
      added: addedEmails,
      alreadyMembers,
      notFound
    });
  } catch (err) {
    console.error('❌ Error creando grupo:', err);
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// ===================== OBTENER DETALLES =====================
router.get('/:id', auth, async (req, res) => {
  if (!requireValidId(req.params.id, res)) return;
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email');

    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    const myId = req.user.id.toString();
    const membersIds = group.members.map(m => m?._id?.toString()).filter(Boolean);
    if (!membersIds.includes(myId)) {
      return res.status(403).json({ msg: 'No autorizado para ver este grupo' });
    }

    const uniqueIds = dedupeMembers(membersIds);
    if (uniqueIds.length !== membersIds.length) {
      group.members = uniqueIds;
      await group.save();
      await group.populate('members', 'name email');
    }

    res.json(group);
  } catch (err) {
    console.error('❌ Error obteniendo grupo:', err);
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// ============== HANDLER COMPARTIDO DE ACTUALIZACIÓN ==============
const updateHandler = async (req, res) => {
  if (!requireValidId(req.params.id, res)) return;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    const myId = req.user.id.toString();
    const membersIds = (group.members || []).map(m => m.toString());
    if (!membersIds.includes(myId)) {
      return res.status(403).json({ msg: 'No autorizado para editar este grupo' });
    }

    const { name, description, currency, isFavorite } = req.body;

    if (name !== undefined) group.name = name;
    if (description !== undefined) {
      // ⚠️ Si quieres prevenir XSS almacenado, puedes sanitizar aquí:
      // const sanitize = require('sanitize-html');
      // group.description = sanitize(description, { allowedTags: [], allowedAttributes: {} });
      group.description = description;
    }
    if (currency !== undefined) group.currency = currency;
    if (isFavorite !== undefined) group.isFavorite = !!isFavorite;

    group.lastActivity = Date.now();
    await group.save();

    const updated = await Group.findById(group._id).populate('members', 'name email');
    res.json({ msg: 'Grupo actualizado', group: updated });
  } catch (err) {
    console.error('❌ Error editando grupo:', err);
    res.status(500).json({ msg: 'Error de servidor' });
  }
};

// ===================== EDITAR GRUPO (PUT y PATCH) =====================
// Usa el mismo handler para PUT y PATCH
router.put('/:id',   auth, validate.body(updateGroupSchema), updateHandler);
router.patch('/:id', auth, validate.body(updateGroupSchema), updateHandler);

// ===================== AGREGAR MIEMBROS POR EMAIL =====================
router.post('/:id/add-members-by-email', auth, async (req, res) => {
  if (!requireValidId(req.params.id, res)) return;
  try {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ msg: 'Debe enviar un arreglo de emails' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    const myId = req.user.id.toString();
    const existingIds = new Set(dedupeMembers(group.members));
    if (!existingIds.has(myId)) {
      return res.status(403).json({ msg: 'No autorizado para agregar miembros' });
    }

    const normalized = emails.filter(Boolean).map(e => String(e).toLowerCase());
    const users = await User.find({ email: { $in: normalized } }).select('_id email');

    const foundEmails = new Set(users.map(u => u.email));
    const toAdd = [];
    const addedEmails = [];
    const alreadyMembers = [];

    for (const u of users) {
      const id = u._id.toString();
      if (!existingIds.has(id)) {
        existingIds.add(id);
        toAdd.push(id);
        addedEmails.push(u.email);
      } else {
        alreadyMembers.push(u.email);
      }
    }

    const notFound = normalized.filter(e => !foundEmails.has(e));

    if (toAdd.length > 0) {
      group.members = Array.from(existingIds);
      group.lastActivity = Date.now();
      await group.save();
    }

    const populated = await Group.findById(group._id).populate('members', 'name email');
    res.json({ msg: 'Proceso de agregado finalizado', added: addedEmails, alreadyMembers, notFound, group: populated });
  } catch (err) {
    console.error('❌ Error agregando miembros por email:', err);
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// ===================== ELIMINAR MIEMBRO =====================
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  const { id, memberId } = req.params;
  if (!requireValidId(id, res) || !requireValidId(memberId, res)) return;
  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    const myId = req.user.id.toString();
    const current = dedupeMembers(group.members);

    if (!current.includes(myId)) {
      return res.status(403).json({ msg: 'No autorizado' });
    }

    if (current.length <= 1 && current[0] === memberId) {
      return res.status(400).json({ msg: 'No puedes dejar el grupo sin miembros' });
    }

    group.members = current.filter(mId => mId !== memberId);
    group.lastActivity = Date.now();
    await group.save();

    const populated = await Group.findById(group._id).populate('members', 'name email');
    res.json({ msg: 'Miembro eliminado', group: populated });
  } catch (err) {
    console.error('❌ Error eliminando miembro:', err);
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// ===================== ELIMINAR GRUPO =====================
router.delete('/:id', auth, async (req, res) => {
  if (!requireValidId(req.params.id, res)) return;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Grupo no encontrado' });

    const myId = req.user.id.toString();
    const membersIds = (group.members || []).map(m => m.toString());
    if (!membersIds.includes(myId)) {
      return res.status(403).json({ msg: 'No autorizado para eliminar este grupo' });
    }

    await Group.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Grupo eliminado' });
  } catch (err) {
    console.error('❌ Error eliminando grupo:', err);
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// ===================== LISTAR MIS GRUPOS =====================
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .select('-__v')
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error('Error obteniendo grupos:', err);
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

module.exports = router;
