import Progress from "../models/Progress.js";

// @route GET /api/progress  (user ke saare subjects ka progress)
export const getProgress = async (req, res, next) => {
  try {
    const items = await Progress.find({ userId: req.user._id });
    res.json({
      success: true,
      data: items.map((p) => ({
        subject: p.subject,
        progress: p.progress,
        icon: p.icon,
        color: p.color,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/progress  (kisi subject ka progress update karein)
export const updateProgress = async (req, res, next) => {
  try {
    const { subject, progress } = req.body;
    const item = await Progress.findOneAndUpdate(
      { userId: req.user._id, subject },
      { progress },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, error: "Subject not found" });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
