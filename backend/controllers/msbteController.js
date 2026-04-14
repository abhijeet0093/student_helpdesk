const MSBTEResult = require('../models/MSBTEResult');
const UTResult    = require('../models/UTResult');
const Student     = require('../models/Student');
const { getMSBTESubjectsForSemester, getAllSubjectsForSemester } = require('../utils/msbteSubjectsConfig');
const { getScheme, validateSubjectMarks } = require('../utils/msbteMarkingScheme');

// ─── STAFF: Submit / update MSBTE Result for a semester ──────────────────────
const submitMSBTEResult = async (req, res) => {
  try {
    const { rollNo, semester, subjects, elective, finalPercentage } = req.body;
    const staffId = req.userId;

    if (!rollNo || !semester) {
      return res.status(400).json({ success: false, message: 'Roll number and semester are required' });
    }
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one subject with marks is required' });
    }
    if (finalPercentage == null || isNaN(parseFloat(finalPercentage))) {
      return res.status(400).json({ success: false, message: 'Final semester percentage is required' });
    }
    const pct = parseFloat(finalPercentage);
    if (pct < 0 || pct > 100) {
      return res.status(400).json({ success: false, message: 'Final percentage must be between 0 and 100' });
    }

    const semInt = parseInt(semester);
    const { electives } = getMSBTESubjectsForSemester(semInt);
    const hasElectives = electives.length > 0;

    // Elective validation
    if (hasElectives) {
      if (!elective || !elective.code) {
        return res.status(400).json({ success: false, message: 'Exactly one elective subject must be selected' });
      }
      const validElective = electives.find(e => e.code === elective.code.toUpperCase());
      if (!validElective) {
        return res.status(400).json({ success: false, message: `"${elective.name}" is not a valid elective for Semester ${semInt}` });
      }
    }

    // Validate each subject marks against marking scheme
    for (const s of subjects) {
      if (!s.code || !s.name) {
        return res.status(400).json({ success: false, message: 'Each subject must have a code and name' });
      }
      const scheme = getScheme(s.code.toUpperCase());
      if (!scheme) {
        return res.status(400).json({ success: false, message: `Unknown subject code: ${s.code}` });
      }
      const err = validateSubjectMarks(s.code, s.theoryMarks, s.practicalMarks);
      if (err) return res.status(400).json({ success: false, message: err });
    }

    // No duplicate subject codes
    const codes = subjects.map(s => s.code.toUpperCase());
    if (new Set(codes).size !== codes.length) {
      return res.status(400).json({ success: false, message: 'Duplicate subjects found in submission' });
    }

    // Find student
    const student = await Student.findOne({ rollNumber: rollNo.toUpperCase() });
    if (!student) {
      return res.status(404).json({ success: false, message: `Student not found: ${rollNo.toUpperCase()}` });
    }

    const cleanSubjects = subjects.map(s => {
      const scheme = getScheme(s.code.toUpperCase());
      const theory    = scheme.theoryMax    !== null ? parseFloat(s.theoryMarks)    : null;
      const practical = scheme.practicalMax !== null ? parseFloat(s.practicalMarks) : null;
      const total     = (theory || 0) + (practical || 0);
      return {
        code:          s.code.toUpperCase(),
        name:          s.name.trim(),
        theoryMarks:   theory,
        practicalMarks: practical,
        totalMarks:    total,
        theoryMax:     scheme.theoryMax,
        practicalMax:  scheme.practicalMax,
        totalMax:      scheme.totalMax,
        // keep legacy marks field = totalMarks for backward compat
        marks:         total,
      };
    });

    const cleanElective = hasElectives && elective
      ? { code: elective.code.toUpperCase(), name: elective.name.trim() }
      : null;

    // Check for existing record
    const existing = await MSBTEResult.findOne({ studentId: student._id, semester: semInt });

    if (existing) {
      if (existing.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'This semester result is already approved. Contact admin to modify.',
        });
      }
      existing.subjects        = cleanSubjects;
      existing.elective        = cleanElective;
      existing.finalPercentage = pct;
      existing.enteredBy       = staffId;
      existing.status          = 'pending';
      existing.approvedBy      = null;
      existing.approvedAt      = null;
      existing.rejectedReason  = null;
      await existing.save();
      return res.status(200).json({ success: true, message: 'MSBTE result updated and sent for admin approval', data: existing });
    }

    const result = await MSBTEResult.create({
      studentId:       student._id,
      rollNo:          student.rollNumber,
      department:      student.department,
      year:            student.year,
      semester:        semInt,
      subjects:        cleanSubjects,
      elective:        cleanElective,
      finalPercentage: pct,
      enteredBy:       staffId,
      status:          'pending',
    });

    res.status(201).json({ success: true, message: 'MSBTE result submitted for admin approval', data: result });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A result for this student and semester already exists' });
    }
    console.error('submitMSBTEResult error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit MSBTE result' });
  }
};

// ─── STAFF: Get results they submitted ───────────────────────────────────────
const getStaffMSBTEResults = async (req, res) => {
  try {
    const staffId = req.userId;
    const results = await MSBTEResult.find({ enteredBy: staffId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch results' });
  }
};

// ─── ADMIN: Get pending MSBTE results ────────────────────────────────────────
const getPendingMSBTEResults = async (req, res) => {
  try {
    const results = await MSBTEResult.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending results' });
  }
};

// ─── ADMIN: Get all MSBTE results (with optional filters) ────────────────────
const getAllMSBTEResults = async (req, res) => {
  try {
    const { rollNo, semester, status } = req.query;
    const query = {};
    if (rollNo)   query.rollNo   = rollNo.toUpperCase();
    if (semester) query.semester = parseInt(semester);
    if (status)   query.status   = status;

    const results = await MSBTEResult.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch MSBTE results' });
  }
};

// ─── ADMIN: Approve single MSBTE result ──────────────────────────────────────
const approveMSBTEResult = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;

    const result = await MSBTEResult.findById(id);
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    result.status         = 'approved';
    result.approvedBy     = adminId;
    result.approvedAt     = new Date();
    result.rejectedReason = null;
    await result.save();

    res.status(200).json({ success: true, message: 'Result approved — now visible to student', data: result });
  } catch (err) {
    console.error('approveMSBTEResult error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve result' });
  }
};

// ─── ADMIN: Reject single MSBTE result ───────────────────────────────────────
const rejectMSBTEResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await MSBTEResult.findById(id);
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    result.status         = 'rejected';
    result.approvedBy     = null;
    result.approvedAt     = null;
    result.rejectedReason = reason || 'Rejected by admin';
    await result.save();

    res.status(200).json({ success: true, message: 'Result rejected — staff can resubmit', data: result });
  } catch (err) {
    console.error('rejectMSBTEResult error:', err);
    res.status(500).json({ success: false, message: 'Failed to reject result' });
  }
};

// ─── ADMIN: Bulk approve pending MSBTE results ───────────────────────────────
const publishMSBTEResults = async (req, res) => {
  try {
    const { semester } = req.body;
    const adminId = req.userId;

    const query = { status: 'pending' };
    if (semester) query.semester = parseInt(semester);

    const pending = await MSBTEResult.find(query);
    if (pending.length === 0) {
      return res.status(404).json({
        success: false,
        message: semester ? `No pending MSBTE results for Semester ${semester}` : 'No pending MSBTE results found',
      });
    }

    await MSBTEResult.updateMany(query, {
      $set: { status: 'approved', approvedBy: adminId, approvedAt: new Date() },
    });

    // Verify the update
    const verifyCount = await MSBTEResult.countDocuments({ status: 'approved' });
    console.log('[publishMSBTEResults] Total approved after publish:', verifyCount);

    res.status(200).json({
      success: true,
      message: `Published ${pending.length} MSBTE result(s)${semester ? ` for Semester ${semester}` : ''}`,
      data: { publishedCount: pending.length, semester: semester || 'All' },
    });
  } catch (err) {
    console.error('publishMSBTEResults error:', err);
    res.status(500).json({ success: false, message: 'Failed to publish MSBTE results' });
  }
};

// ─── STUDENT: Get approved MSBTE results ─────────────────────────────────────
const getMyMSBTEResults = async (req, res) => {
  try {
    const studentId = req.userId;
    console.log('[getMyMSBTEResults] studentId from token:', studentId);

    // Convert to ObjectId explicitly to avoid string vs ObjectId mismatch
    const mongoose = require('mongoose');
    const oid = new mongoose.Types.ObjectId(studentId);

    const results = await MSBTEResult.find({
      studentId: oid,
      status: 'approved',
    }).sort({ semester: 1 });

    console.log('[getMyMSBTEResults] Found:', results.length, 'approved records');

    const data = results.map(r => {
      // Normalize subjects — handle both old schema (subjectCode/subjectName/marksObtained)
      // and new schema (code/name/marks) so old DB documents display correctly
      const subjects = (r.subjects || []).map(s => ({
        code:          s.code  || s.subjectCode  || '',
        name:          s.name  || s.subjectName  || '',
        // new fields
        theoryMarks:   s.theoryMarks   != null ? s.theoryMarks   : null,
        practicalMarks: s.practicalMarks != null ? s.practicalMarks : null,
        totalMarks:    s.totalMarks    != null ? s.totalMarks    : null,
        theoryMax:     s.theoryMax     != null ? s.theoryMax     : null,
        practicalMax:  s.practicalMax  != null ? s.practicalMax  : null,
        totalMax:      s.totalMax      != null ? s.totalMax      : null,
        // legacy fallback
        marks: s.marks != null ? s.marks : (s.marksObtained != null ? s.marksObtained : null),
      }));

      return {
        semester:        r.semester,
        subjects,
        elective:        r.elective || null,
        finalPercentage: r.finalPercentage,
        grade:           r.grade,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getMyMSBTEResults error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch MSBTE results' });
  }
};

// ─── STUDENT: Get UT results (current + archived) ────────────────────────────
const getMyUTResults = async (req, res) => {
  try {
    const studentId = req.userId;
    const student   = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const mongoose = require('mongoose');
    const oid = new mongoose.Types.ObjectId(studentId);

    console.log('[getMyUTResults] studentId:', studentId, '| year:', student.year);

    const [current, archived] = await Promise.all([
      // isArchived: false OR field doesn't exist (old documents)
      UTResult.find({ studentId: oid, isPublished: true, $or: [{ isArchived: false }, { isArchived: { $exists: false } }] })
        .sort({ semester: 1, utType: 1, subjectName: 1 }),
      UTResult.find({ studentId: oid, isPublished: true, isArchived: true })
        .sort({ semester: 1, utType: 1, subjectName: 1 }),
    ]);

    const yearMap = { 1: [1, 2], 2: [3, 4], 3: [5, 6] };
    const yearSems = yearMap[student.year] || [1, 2];
    const semsInData = [...new Set(current.map(r => r.semester))].sort((a, b) => a - b);
    const currentSemesters = semsInData.length > 0 ? semsInData : yearSems;

    console.log('[getMyUTResults] current:', current.length, '| archived:', archived.length, '| sems:', currentSemesters);

    res.status(200).json({
      success: true,
      data: { current, archived, studentYear: student.year, currentSemesters },
    });
  } catch (err) {
    console.error('getMyUTResults error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch UT results' });
  }
};

// ─── ADMIN: Archive UT results for a semester ────────────────────────────────
const archiveUTResults = async (req, res) => {
  try {
    const { semester } = req.body;
    if (!semester) return res.status(400).json({ success: false, message: 'Semester is required' });

    const result = await UTResult.updateMany(
      { semester: parseInt(semester), isPublished: true, isArchived: false },
      { $set: { isArchived: true } }
    );

    res.status(200).json({
      success: true,
      message: `Archived ${result.modifiedCount} UT result(s) for Semester ${semester}`,
      data: { archivedCount: result.modifiedCount, semester },
    });
  } catch (err) {
    console.error('archiveUTResults error:', err);
    res.status(500).json({ success: false, message: 'Failed to archive UT results' });
  }
};

// ─── STAFF/ADMIN: Get MSBTE subjects for a semester ──────────────────────────
const getMSBTESubjects = async (req, res) => {
  try {
    const { semester } = req.params;
    const data = getMSBTESubjectsForSemester(semester);
    if (data.compulsory.length === 0) {
      return res.status(404).json({ success: false, message: `No subjects found for Semester ${semester}` });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
};

module.exports = {
  submitMSBTEResult,
  getStaffMSBTEResults,
  getPendingMSBTEResults,
  getAllMSBTEResults,
  approveMSBTEResult,
  rejectMSBTEResult,
  publishMSBTEResults,
  getMyMSBTEResults,
  getMyUTResults,
  archiveUTResults,
  getMSBTESubjects,
};
