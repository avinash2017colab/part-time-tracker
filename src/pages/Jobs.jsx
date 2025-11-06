import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Navbar from "../components/Navbar"; // 👈 Added

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobName, setJobName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [location, setLocation] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [editingJob, setEditingJob] = useState(null);
  const [editValues, setEditValues] = useState({
    jobName: "",
    hourlyRate: "",
    location: "",
    color: "",
  });

  useEffect(() => {
    if (!user) return;
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    const querySnapshot = await getDocs(collection(db, "users", user.uid, "jobs"));
    const jobsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(jobsList);
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!jobName || !hourlyRate) return alert("Please enter job name and rate");

    await addDoc(collection(db, "users", user.uid, "jobs"), {
      jobName,
      hourlyRate: parseFloat(hourlyRate),
      location,
      color,
      createdAt: serverTimestamp(),
    });

    setJobName("");
    setHourlyRate("");
    setLocation("");
    setColor("#4f46e5");
    fetchJobs();
  };

  const handleDeleteJob = async (jobId) => {
    await deleteDoc(doc(db, "users", user.uid, "jobs", jobId));
    setJobs(jobs.filter((job) => job.id !== jobId));
  };

  const handleEdit = (job) => {
    setEditingJob(job.id);
    setEditValues({
      jobName: job.jobName,
      hourlyRate: job.hourlyRate,
      location: job.location,
      color: job.color,
    });
  };

  const handleSaveEdit = async (jobId) => {
    const jobRef = doc(db, "users", user.uid, "jobs", jobId);
    await updateDoc(jobRef, {
      jobName: editValues.jobName,
      hourlyRate: parseFloat(editValues.hourlyRate),
      location: editValues.location,
      color: editValues.color,
    });
    setEditingJob(null);
    fetchJobs();
  };

  const handleCancelEdit = () => setEditingJob(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> {/* 👈 Navigation Bar */}
      <div className="flex flex-col items-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6">
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Manage Jobs</h2>

          {/* Add Job Form */}
          <form onSubmit={handleAddJob} className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Job Name"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="number"
              placeholder="Hourly Rate ($)"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-4">
              <label htmlFor="color" className="font-medium">Job Color:</label>
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-12 border rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
            >
              Add Job
            </button>
          </form>

          {/* Job List */}
          <div className="space-y-4">
            {jobs.length === 0 && (
              <p className="text-center text-gray-500">No jobs added yet.</p>
            )}
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-4"
                style={{ borderLeft: `8px solid ${job.color}` }}
              >
                {editingJob === job.id ? (
                  <div className="w-full space-y-2">
                    <input
                      type="text"
                      value={editValues.jobName}
                      onChange={(e) => setEditValues({ ...editValues, jobName: e.target.value })}
                      className="w-full px-3 py-1 border rounded"
                    />
                    <input
                      type="number"
                      value={editValues.hourlyRate}
                      onChange={(e) => setEditValues({ ...editValues, hourlyRate: e.target.value })}
                      className="w-full px-3 py-1 border rounded"
                    />
                    <input
                      type="text"
                      value={editValues.location}
                      onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                      className="w-full px-3 py-1 border rounded"
                    />
                    <div className="flex items-center gap-2">
                      <label>Color:</label>
                      <input
                        type="color"
                        value={editValues.color}
                        onChange={(e) => setEditValues({ ...editValues, color: e.target.value })}
                        className="h-6 w-10 border rounded"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(job.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-bold text-lg">{job.jobName}</h3>
                      <p className="text-sm text-gray-600">
                        ${job.hourlyRate}/hr {job.location && `· ${job.location}`}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleEdit(job)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
