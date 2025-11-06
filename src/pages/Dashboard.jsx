import { useState, useEffect } from "react";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    const jobsSnapshot = await getDocs(collection(db, "users", user.uid, "jobs"));
    setTotalJobs(jobsSnapshot.size);

    const shiftsSnapshot = await getDocs(collection(db, "users", user.uid, "shifts"));
    let hours = 0;
    let earnings = 0;
    let weekEarn = 0;

    // Get start of current week (Monday 00:00)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    shiftsSnapshot.forEach((doc) => {
      const shift = doc.data();
      if (shift.durationHours) {
        hours += shift.durationHours;
        earnings += shift.earnings || 0;

        const shiftDate = new Date(shift.startTime.seconds * 1000);
        if (shiftDate >= weekStart) {
          weekEarn += shift.earnings || 0;
        }
      }
    });

    setTotalHours(hours.toFixed(2));
    setTotalEarnings(earnings.toFixed(2));
    setWeekEarnings(weekEarn.toFixed(2));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome to Your Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Total Jobs */}
          <div className="bg-indigo-500 text-white p-6 rounded-2xl shadow-md text-center">
            <p className="text-lg font-semibold">Total Jobs</p>
            <p className="text-3xl font-bold mt-2">{totalJobs}</p>
          </div>

          {/* Total Hours */}
          <div className="bg-purple-500 text-white p-6 rounded-2xl shadow-md text-center">
            <p className="text-lg font-semibold">Total Hours</p>
            <p className="text-3xl font-bold mt-2">{totalHours}</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-green-500 text-white p-6 rounded-2xl shadow-md text-center">
            <p className="text-lg font-semibold">Total Earnings</p>
            <p className="text-3xl font-bold mt-2">${totalEarnings}</p>
          </div>

          {/* This Week’s Earnings */}
          <div className="bg-yellow-400 text-white p-6 rounded-2xl shadow-md text-center">
            <p className="text-lg font-semibold">This Week’s Earnings</p>
            <p className="text-3xl font-bold mt-2">${weekEarnings}</p>
          </div>
        </div>

        <p className="text-gray-600 text-center mt-8 text-sm sm:text-base">
          Track your shifts, manage jobs, and view your weekly performance in real time.
        </p>
      </div>
    </div>
  );
}
