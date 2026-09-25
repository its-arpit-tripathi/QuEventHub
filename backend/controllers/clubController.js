import Club from '../models/Club.js';
import bcrypt from 'bcrypt';
import { uploadImage } from '../utils/cloudinary.js';

const buildClubQuery = ({ type, q }) => {
  const query = {};

  if (type && type !== 'all') {
    query.category = type.toLowerCase();
  }

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  return query;
};

export const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find(buildClubQuery(req.query))
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs.map((club) => ({
        ...club,
        membersCount: club.members?.length || 0,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClub = async (req, res) => {
  try {
    const imageUrl = req.file
      ? await uploadImage(req.file, 'queventhub/clubs')
      : req.body.imageUrl;

    // Generate login credentials for this club
    const rawClubId = `CLB${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const rawPassword = Math.random().toString(36).substring(2, 10);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const payload = {
      name: req.body.name,
      category: req.body.category?.toLowerCase() || 'technical',
      description: req.body.description,
      meeting: req.body.meeting,
      time: req.body.time,
      venue: req.body.venue,
      imageUrl,
      contactEmail: req.body.contactEmail,
      clubId: rawClubId,
      passwordHash,
      createdBy: req.user._id,
    };

    const club = await Club.create(payload);

    // Return club plus the one-time plain credentials for admin to share
    res.status(201).json({
      success: true,
      data: {
        club,
        credentials: {
          clubId: rawClubId,
          password: rawPassword,
        },
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('members', 'name email q_id');
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    res.status(200).json({ success: true, data: club });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClub = async (req, res) => {
  try {
    const updates = {
      ...req.body,
    };

    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    if (req.file) {
      updates.imageUrl = await uploadImage(req.file, 'queventhub/clubs');
    }

    if (updates.category) {
      updates.category = updates.category.toLowerCase();
    }

    const club = await Club.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    res.status(200).json({ success: true, data: club });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteClub = async (req, res) => {
  try {
    const deleted = await Club.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    res.status(200).json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const alreadyMember = club.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'Already a member of this club' });
    }

    club.members.push(req.user._id);
    await club.save();

    res.status(200).json({
      success: true,
      message: 'Joined club successfully',
      data: {
        clubId: club._id,
        membersCount: club.members.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
