import QuizResult from "../models/QuizResult.js";
import User from "../models/User.js";

// @route GET /api/quiz/results  (user ke saare quiz results)
export const getResults = async (req, res, next) => {
  try {
    const results = await QuizResult.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({
      success: true,
      data: results.map((r) => ({
        id: r._id.toString(),
        subject: r.subject,
        score: r.score,
        total: r.total,
        xpEarned: r.xpEarned,
        takenAt: r.takenAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/quiz/submit  (quiz ka result save karein + XP do)
export const submitResult = async (req, res, next) => {
  try {
    const { subject, score, total, answers } = req.body;
    const xpEarned = score * 10;

    const result = await QuizResult.create({
      userId: req.user._id,
      subject,
      score,
      total,
      xpEarned,
      answers: answers || [],
    });

    // User ko XP aur level update karein
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.level = Math.floor(user.xp / 100) + 1;
    await user.save();

    res.status(201).json({
      success: true,
      message: `Quiz saved! +${xpEarned} XP`,
      data: {
        result: {
          id: result._id.toString(),
          subject: result.subject,
          score: result.score,
          total: result.total,
          xpEarned: result.xpEarned,
          takenAt: result.takenAt,
        },
        user: user.toPublic(),
      },
    });
  } catch (error) {
    next(error);
  }
};
