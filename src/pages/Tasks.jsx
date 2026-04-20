import { useState, useEffect } from "react";
import { useTasks } from "../hooks/useTasks";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {
  const { tasks, addTask, deleteTask, toggleTask, updateLectureCount, loading, error } = useTasks();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskType, setTaskType] = useState("todo"); // "todo" or "lecture"
  const [totalLectures, setTotalLectures] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (error) {
      console.log("Task error:", error);
    }
  }, [error]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    if (taskType === "lecture" && !totalLectures) {
      alert("Please enter total number of lectures");
      return;
    }

    const taskData = {
      title: title.trim(),
      dueDate: dueDate || null,
      completed: false,
      type: taskType,
      ...(taskType === "lecture" && {
        totalLectures: parseInt(totalLectures),
        watchedLectures: 0
      })
    };

    // Clear form immediately
    setTitle("");
    setDueDate("");
    setTotalLectures("");
    setTaskType("todo");

    // Fire off the add in background
    addTask(taskData).catch((err) => {
      console.error("Failed to add task:", err);
    });
  };

  return (
    <div className="tasks-container">
      <h1>📝 My Tasks</h1>

      {showDebug && (
        <div style={{
          background: "#f0f4ff",
          color: "#667eea",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          border: "1px solid #667eea",
          fontSize: "0.85rem",
          fontFamily: "monospace"
        }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Debug Info:</strong>
            <button 
              onClick={() => setShowDebug(false)}
              style={{ marginLeft: "1rem", cursor: "pointer" }}
            >
              Hide
            </button>
          </div>
          <div>User UID: {user?.uid || "Not authenticated"}</div>
          <div>Loading: {loading ? "Yes ⏳" : "No ✓"}</div>
          <div>Error: {error || "None"}</div>
          <div>Tasks: {tasks.length}</div>
        </div>
      )}

      {error && (
        <div style={{
          background: "#fed7d7",
          color: "#c53030",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          border: "1px solid #fc8181"
        }}>
          <strong>⚠️ Error:</strong> {error}
          <div style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            <strong>Fix:</strong> 
            <ol style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
              <li>Go to Firebase Console</li>
              <li>Click Firestore Database</li>
              <li>Create collection: <code>users</code></li>
              <li>In <code>users</code>, create document with ID = your user UID</li>
              <li>In that doc, create collection: <code>tasks</code></li>
              <li>Or check Firestore Security Rules allow read/write</li>
            </ol>
          </div>
        </div>
      )}

      <div className="add-task-form">
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          style={{
            padding: "0.875rem 1.25rem",
            border: "2px solid var(--border)",
            borderRadius: "12px",
            fontSize: "1rem",
            background: "var(--bg)",
            color: "var(--text-h)",
            cursor: "pointer",
            minWidth: "120px"
          }}
        >
          <option value="todo">📝 Task</option>
          <option value="lecture">🎥 Lecture</option>
        </select>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Enter task title..."
        />
        
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          placeholder="Due date"
        />

        {taskType === "lecture" && (
          <input
            type="number"
            value={totalLectures}
            onChange={(e) => setTotalLectures(e.target.value)}
            placeholder="Total lectures"
            min="1"
            style={{
              minWidth: "130px"
            }}
          />
        )}

        <button onClick={handleAdd}>Add</button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "0.9rem", color: "#a0aec0" }}>Loading your tasks...</p>
        </div>
      )}

      {!loading && (
        <>
          {tasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks yet. Add one above to get started! 🚀</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-item">
                  {task.type === "lecture" ? (
                    // Lecture task UI
                    <>
                      <div className="task-content" style={{ flex: 1 }}>
                        <span>{task.title}</span>
                        <div style={{
                          marginTop: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem"
                        }}>
                          <div style={{
                            height: "6px",
                            background: "#e2e8f0",
                            borderRadius: "3px",
                            flex: 1,
                            overflow: "hidden"
                          }}>
                            <div style={{
                              height: "100%",
                              background: "linear-gradient(90deg, #667eea, #764ba2)",
                              width: `${(task.watchedLectures / task.totalLectures) * 100}%`,
                              transition: "width 0.3s ease"
                            }} />
                          </div>
                          <span style={{
                            fontSize: "0.8rem",
                            color: "#a0aec0",
                            minWidth: "50px",
                            textAlign: "right"
                          }}>
                            {task.watchedLectures}/{task.totalLectures}
                          </span>
                        </div>
                        {task.dueDate && (
                          <span className="due-date">
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => updateLectureCount(task.id, task.watchedLectures - 1)}
                          disabled={task.watchedLectures === 0}
                          style={{
                            padding: "0.5rem 0.75rem",
                            background: task.watchedLectures === 0 ? "#cbd5e0" : "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: task.watchedLectures === 0 ? "not-allowed" : "pointer",
                            fontSize: "0.875rem"
                          }}
                        >
                          −
                        </button>
                        <button
                          onClick={() => updateLectureCount(task.id, task.watchedLectures + 1)}
                          disabled={task.watchedLectures === task.totalLectures}
                          style={{
                            padding: "0.5rem 0.75rem",
                            background: task.watchedLectures === task.totalLectures ? "#cbd5e0" : "#48bb78",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: task.watchedLectures === task.totalLectures ? "not-allowed" : "pointer",
                            fontSize: "0.875rem"
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => deleteTask(task.id)}>
                        Delete
                      </button>
                    </>
                  ) : (
                    // Regular task UI
                    <>
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={() => toggleTask(task)}
                      />
                      <div className="task-content">
                        <span className={task.completed ? "completed" : ""}>{task.title}</span>
                        {task.dueDate && (
                          <span className="due-date">
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <button onClick={() => deleteTask(task.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}