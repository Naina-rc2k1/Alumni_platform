const Alumni = require('../models/Alumni');


exports.getAlumni = async (req, res, next) => {
  try {
    const alumni = await Alumni.find();
    res.status(200).json({ success: true, data: alumni });
  } catch (error) {
    next(error);
  }
};


exports.getAlumnusById = async (req, res, next) => {
  try {
    const alumnus = await Alumni.findById(req.params.id);
    if (!alumnus) {
      return res.status(404).json({ success: false, message: 'Alumnus not found' });
    }
    res.status(200).json({ success: true, data: alumnus });
  } catch (error) {
    next(error);
  }
};


exports.createAlumnus = async (req, res, next) => {
  try {
    const alumnus = await Alumni.create(req.body);
    res.status(201).json({ success: true, data: alumnus });
  } catch (error) {
    next(error);
  }
};


exports.updateAlumnus = async (req, res, next) => {
  try {
    const alumnus = await Alumni.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!alumnus) {
      return res.status(404).json({ success: false, message: 'Alumnus not found' });
    }
    res.status(200).json({ success: true, data: alumnus });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlumnus = async (req, res, next) => {
  try {
    const alumnus = await Alumni.findByIdAndDelete(req.params.id);
    if (!alumnus) {
      return res.status(404).json({ success: false, message: 'Alumnus not found' });
    }
    res.status(200).json({ success: true, message: 'Alumnus deleted' });
  } catch (error) {
    next(error);
  }
};