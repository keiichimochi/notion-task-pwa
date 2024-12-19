import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/notion');
      const data = await response.json();
      const formattedTasks = data.results.map((task: any) => ({
        id: task.id,
        title: task.properties.Title.title[0].plain_text,
        status: task.properties.Status.select.name,
        dueDate: task.properties['Due Date'].date.start,
      }));
      setTasks(formattedTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          status: 'Not Started',
        }),
      });
      setNewTask({ title: '', dueDate: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await fetch('/api/notion', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: taskId,
          properties: {
            Status: {
              select: {
                name: newStatus,
              },
            },
          },
        }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Task Manager</h1>
        
        {/* Add Task Form */}
        <form onSubmit={addTask} className="mb-8 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
              className="flex-1 p-2 border rounded"
              required
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Task List */}
        {loading ? (
          <div className="text-center">Loading tasks...</div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                </div>
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}