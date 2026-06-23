import Assignment from "../models/Assignment.js";
import User from "../models/User.js";

// @route GET /api/assignments  (user ke saare assignments)
export const getAssignments = async (req, res, next) => {
  try {
    const items = await Assignment.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json({
      success: true,
      data: items.map((a) => ({
        id: a._id.toString(),
        subject: a.subject,
        title: a.title,
        description: a.description,
        status: a.status,
        difficulty: a.difficulty,
        questions: a.questions,
        marks: a.marks,
        obtainedMarks: a.obtainedMarks,
        due: a.due,
        icon: a.icon,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/assignments/:id/submit  (assignment submit karein)
export const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assignment) return res.status(404).json({ success: false, error: "Assignment not found" });

    if (assignment.status === "submitted") {
      return res.status(400).json({ success: false, error: "Already submitted" });
    }

    // Auto-grade (demo: 90% marks)
    assignment.status = "submitted";
    assignment.obtainedMarks = Math.round(assignment.marks * 0.9);
    assignment.due = "Submitted just now";
    await assignment.save();

    // User ko +15 XP
    const user = await User.findById(req.user._id);
    user.xp += 15;
    user.level = Math.floor(user.xp / 100) + 1;
    await user.save();

    res.json({
      success: true,
      message: `Submitted! ${assignment.obtainedMarks}/${assignment.marks} marks · +15 XP`,
      data: {
        assignment: {
          id: assignment._id.toString(),
          marks: assignment.marks,
          obtainedMarks: assignment.obtainedMarks,
        },
        user: user.toPublic(),
      },
    });
  } catch (error) {
    next(error);
  }
};
