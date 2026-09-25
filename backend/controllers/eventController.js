import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { uploadImage } from '../utils/cloudinary.js';

export const getEvents = async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = {

//      registrationDeadline: { $gte: new Date() } 
    };

    if (category) {
      query.category = category;
    }

    const events = await Event.find(query).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Club-managed events ---

export const createClubEvent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'club') {
      return res.status(403).json({ success: false, message: 'Only clubs can create events' });
    }

    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const paymentQrFile = req.files && req.files['paymentQr'] ? req.files['paymentQr'][0] : null;

    const imageUrl = imageFile
      ? await uploadImage(imageFile, 'queventhub/events')
      : req.body.imageUrl;

    const paymentQrCode = paymentQrFile
      ? await uploadImage(paymentQrFile, 'queventhub/events')
      : req.body.paymentQrCode;

    const payload = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      venue: req.body.venue,
      registrationDeadline: req.body.registrationDeadline || req.body.date,
      category: req.body.category,
      isPaid: req.body.isPaid === true || req.body.isPaid === 'true',
      price: Number(req.body.price) || 0,
      paymentQrCode,
      imageUrl,
      capacity: Number(req.body.capacity) || 0,
      organizer: req.club?.name || 'Club Event',
      club: req.user._id,
    };

    const event = await Event.create(payload);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getClubEvents = async (req, res) => {
  try {
    const events = await Event.find({ club: req.user._id }).sort({ date: 1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClubEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, club: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found for this club' });
    }

    Object.assign(event, req.body);
    if (req.body.isPaid !== undefined) event.isPaid = req.body.isPaid === true || req.body.isPaid === 'true';
    if (req.body.price !== undefined) event.price = Number(req.body.price) || 0;
    if (req.body.capacity !== undefined) event.capacity = Number(req.body.capacity) || 0;
    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const paymentQrFile = req.files && req.files['paymentQr'] ? req.files['paymentQr'][0] : null;

    if (imageFile) event.imageUrl = await uploadImage(imageFile, 'queventhub/events');
    if (paymentQrFile) event.paymentQrCode = await uploadImage(paymentQrFile, 'queventhub/events');
    await event.save();

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteClubEvent = async (req, res) => {
  try {
    const deleted = await Event.findOneAndDelete({ _id: req.params.id, club: req.user._id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Event not found for this club' });
    }
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClubEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, club: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found for this club' });
    }

    const regs = await Registration.find({ event: event._id })
      .populate('user', 'name email q_id course section year')
      .sort({ registeredAt: 1 });

    res.status(200).json({
      success: true,
      count: regs.length,
      data: regs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, club: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found for this club' });
    }

    const now = new Date();
    const eventDate = new Date(event.date);

    const isSameDay =
      now.getFullYear() === eventDate.getFullYear() &&
      now.getMonth() === eventDate.getMonth() &&
      now.getDate() === eventDate.getDate();

    if (!isSameDay) {
      return res.status(400).json({
        success: false,
        message: 'Attendance can only be marked on the event day',
      });
    }

    const registration = await Registration.findOne({
      _id: req.params.registrationId,
      event: event._id,
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.attended) {
      return res.status(400).json({ success: false, message: 'Attendance already marked' });
    }

    registration.attended = true;
    registration.attendedAt = now;
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: registration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { eventId, transactionId } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: 'Event not found' });
    }


    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration is closed for this event.' 
      });
    }

    const existingReg = await Registration.findOne({
      user: userId,
      event: eventId,
    });
    if (existingReg) {
      return res
        .status(400)
        .json({ success: false, message: 'Already registered' });
    }

    if (!event.isPaid) {
      await Registration.create({
        user: userId,
        event: eventId,
        status: 'Registered',
      });

      return res.status(200).json({
        success: true,
        message: 'Successfully registered for free event!',
      });
    }
    
    if (event.isPaid && !transactionId) {
      return res.status(200).json({
        success: true,
        requiresPayment: true,
        amount: event.price,
        qrCodeUrl: event.paymentQrCode,
        message: 'Payment required. Please scan QR and submit transaction ID.',
      });
    }

    if (event.isPaid && transactionId) {
      await Registration.create({
        user: userId,
        event: eventId,
        transactionId,
        status: 'Pending Payment',
      });

      return res.status(200).json({
        success: true,
        message: 'Registration submitted! Payment verification pending.',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await Registration.find({ user: userId })
      .populate('event', 'title date category isPaid organizer registrationDeadline')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error fetching my events',
    });
  }
};