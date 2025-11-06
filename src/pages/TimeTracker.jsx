import { useState, useEffect } from "react";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import Navbar from "../components/Navbar"; // ✅ Navbar imported

export default function TimeTracker() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [selectedJob, setSelectedJob] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  const [editingShift, setEditingShift] = useState(null);
  const [editValues, setEditValues] = useState({
    startTime: "",
    endTime: "",
    notes: "",
    jobId: "",
  });

  useEffect(() => {
    if (!user) return;
    fetchJobs();
    fetchShifts();
  }, [user]);

  const fetchJobs = async () => {
    const q = await getDocs(collection(db, "users", user.uid, "jobs"));
    setJobs(q.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchShifts = async () => {
    const q = query(collection(db, "users", user.uid, "shifts"), orderBy("startTime", "desc"));
    const snapshot = await getDocs(q);
    setShifts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    if (!selectedJob || !startTime || !endTime) return alert("Please fill all fields.");

    const job = jobs.find((j) => j.id === selectedJob);
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) return alert("End time must be after start time.");

    const durationHours = (end - start) / (1000 * 60 * 60);
    const earnings = durationHours * job.hourlyRate;

    await addDoc(collection(db, "users", user.uid, "shifts"), {
      jobId: job.id,
      jobName: job.jobName,
      startTime: start,
      endTime: end,
      durationHours: parseFloat(durationHours.toFixed(2)),
      earnings: parseFloat(earnings.toFixed(2)),
      notes,
      createdAt: serverTimestamp(),
    });

    setSelectedJob("");
    setStartTime("");
    setEndTime("");
    setNotes("");
    fetchShifts();
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm("Delete this shift?")) {
      await deleteDoc(doc(db, "users", user.uid, "shifts", shiftId));
      setShifts(shifts.filter((s) => s.id !== shiftId));
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift.id);
    setEditValues({
      startTime: new Date(shift.startTime.seconds * 1000).toISOString().slice(0, 16),
      endTime: new Date(shift.endTime.seconds * 1000).toISOString().slice(0, 16),
      notes: shift.notes || "",
      jobId: shift.jobId,
    });
  };

  const handleSaveEdit = async (shiftId) => {
    const job = jobs.find((j) => j.id === editValues.jobId);
    const start = new Date(editValues.startTime);
    const end = new Date(editValues.endTime);

    if (end <= start) return alert("End time must be after start time.");

    const durationHours = (end - start) / (1000 * 60 * 60);
    const earnings = durationHours * job.hourlyRate;

    const shiftRef = doc(db, "users", user.uid, "shifts", shiftId);
    await updateDoc(shiftRef, {
      jobId: job.id,
      jobName: job.jobName,
      startTime: start,
      endTime: end,
      durationHours: parseFloat(durationHours.toFixed(2)),
      earnings: parseFloat(earnings.toFixed(2)),
      notes: editValues.notes,
    });

    setEditingShift(null);
    fetchShifts();
  };

  const handleCancelEdit = () => setEditingShift(null);

  // ✅ RETURN STARTS HERE — INSIDE THE FUNCTION
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> {/* ✅ Navbar added here */}
      <div className="flex flex-col items-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6">
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Manual Time Tracker</h2>

          {/* Add Shift Form */}
          <form onSubmit={handleAddShift} className="space-y-4 mb-6">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select Job --</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.jobName} (${job.hourlyRate}/hr)
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full border rounded-lg px-4 py-2"
              rows="2"
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
            >
              ➕ Add Shift
            </button>
          </form>

          {/* Shift List */}
          <h3 className="text-xl font-semibold mb-3 text-center">Shift History</h3>
          <div className="max-h-64 overflow-y-auto space-y-3">
            {shifts.length === 0 && <p className="text-gray-500 text-center">No shifts logged yet.</p>}
            {shifts.map((shift) => (
              <div key={shift.id} className="p-4 border rounded-lg">
                {editingShift === shift.id ? (
                  <div className="space-y-3">
                    <select
                      value={editValues.jobId}
                      onChange={(e) => setEditValues({ ...editValues, jobId: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.jobName} (${job.hourlyRate}/hr)
                        </option>
                      ))}
                    </select>

                    <input
                      type="datetime-local"
                      value={editValues.startTime}
                      onChange={(e) => setEditValues({ ...editValues, startTime: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                    />

                    <input
                      type="datetime-local"
                      value={editValues.endTime}
                      onChange={(e) => setEditValues({ ...editValues, endTime: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                    />

                    <textarea
                      value={editValues.notes}
                      onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                      rows="2"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(shift.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-1 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{shift.jobName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(shift.startTime.seconds * 1000).toLocaleString()} —{" "}
                        {new Date(shift.endTime.seconds * 1000).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {shift.durationHours} hrs · ${shift.earnings}
                      </p>
                      {shift.notes && <p className="text-xs text-gray-400 italic">{shift.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditShift(shift)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
