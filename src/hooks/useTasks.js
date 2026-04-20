import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export const useTasks = () => {
  const { tasks, setTasks } = useApp();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 📥 Fetch tasks
  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      // Wait for auth to load
      if (authLoading) {
        return;
      }

      // If no user, not authenticated
      if (!user) {
        if (isMounted) {
          setLoading(false);
          setTasks([]);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const tasksRef = collection(db, "users", user.uid, "tasks");
        const snapshot = await getDocs(tasksRef);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isMounted) {
          setTasks(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err.code, err.message);
        
        if (isMounted) {
          setError(err.message || "Failed to load tasks. Check Firestore security rules and ensure collection exists.");
          setTasks([]);
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // ➕ Add task (optimistic update)
  const addTask = async (task) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      
      const tempId = `temp_${Date.now()}`;
      const taskData = {
        title: task.title,
        dueDate: task.dueDate || null,
        completed: task.completed || false,
        type: task.type || "todo",
        createdAt: new Date().toISOString(),
        userId: user.uid,
        ...(task.type === "lecture" && {
          totalLectures: task.totalLectures,
          watchedLectures: task.watchedLectures || 0
        })
      };

      // Optimistic update - update UI immediately
      setTasks((prev) => [...prev, { id: tempId, ...taskData }]);

      // Then sync with Firestore
      const docRef = await addDoc(
        collection(db, "users", user.uid, "tasks"),
        taskData
      );

      // Replace temp ID with real ID
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? { id: docRef.id, ...taskData } : t))
      );
    } catch (err) {
      console.error("Error adding task:", err.code, err.message);
      // Revert on error
      setTasks((prev) => prev.filter((t) => !t.id.startsWith("temp_")));
      const errorMsg = err.code === "permission-denied" 
        ? "Permission denied. Check Firestore rules or create /users/{uid}/tasks collection"
        : err.message;
      setError(errorMsg);
    }
  };

  // ❌ Delete task (optimistic update)
  const deleteTask = async (id) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);

      // Keep backup in case we need to revert
      const deletedTask = tasks.find((t) => t.id === id);

      // Optimistic update - remove immediately
      setTasks((prev) => prev.filter((t) => t.id !== id));

      // Then sync with Firestore
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    } catch (err) {
      console.error("Error deleting task:", err.code, err.message);
      // Revert on error - restore the task
      setTasks((prev) => {
        const taskToRestore = tasks.find((t) => t.id === id);
        return taskToRestore ? [...prev, taskToRestore] : prev;
      });
      const errorMsg = err.code === "permission-denied" 
        ? "Permission denied. Check Firestore rules"
        : err.message;
      setError(errorMsg);
    }
  };

  // 🔄 Toggle complete (optimistic update)
  const toggleTask = async (task) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);

      const newCompleted = !task.completed;

      // Optimistic update - toggle immediately
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: newCompleted } : t
        )
      );

      // Then sync with Firestore
      const ref = doc(db, "users", user.uid, "tasks", task.id);
      await updateDoc(ref, {
        completed: newCompleted,
      });
    } catch (err) {
      console.error("Error toggling task:", err.code, err.message);
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: !newCompleted } : t
        )
      );
      const errorMsg = err.code === "permission-denied" 
        ? "Permission denied. Check Firestore rules"
        : err.message;
      setError(errorMsg);
    }
  };

  // ✏️ Update task (edit)
  const updateTask = async (id, updatedData) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      const ref = doc(db, "users", user.uid, "tasks", id);

      await updateDoc(ref, updatedData);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updatedData } : t
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.message);
    }
  };

  // 🎥 Update lecture count (optimistic update)
  const updateLectureCount = async (id, newCount) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);

      // Optimistic update - increment immediately
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, watchedLectures: newCount } : t
        )
      );

      // Then sync with Firestore
      const ref = doc(db, "users", user.uid, "tasks", id);
      await updateDoc(ref, {
        watchedLectures: newCount,
      });
    } catch (err) {
      console.error("Error updating lecture count:", err.code, err.message);
      // Revert on error
      const task = tasks.find((t) => t.id === id);
      if (task) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, watchedLectures: task.watchedLectures } : t
          )
        );
      }
      const errorMsg = err.code === "permission-denied" 
        ? "Permission denied. Check Firestore rules"
        : err.message;
      setError(errorMsg);
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    deleteTask,
    toggleTask,
    updateTask,
    updateLectureCount,
  };
};
